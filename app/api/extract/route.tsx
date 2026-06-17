// src/app/api/extract/route.ts
import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { extract } from "@extractus/article-extractor";

interface ExtractRequestBody {
	url?: string;
}
interface ExtractApiResponse {
	data?: string | null;
	error?: string;
}

export async function POST(
	request: NextRequest,
): Promise<NextResponse<ExtractApiResponse>> {
	console.log("API Route: /api/extract received POST request");
	let requestBody: ExtractRequestBody;
	try {
		requestBody = await request.json();
	} catch (error) {
		console.error("API Route Error: Invalid JSON body in /api/extract", error);
		return NextResponse.json(
			{ error: "Invalid request body. Expecting JSON with a 'url' property." },
			{ status: 400 },
		);
	}
	const url = requestBody.url;
	if (!url || typeof url !== "string" || !url.startsWith("http")) {
		console.error("API Route Error: Missing or invalid 'url' in request body.");
		return NextResponse.json(
			{ error: "Missing or invalid 'url' property in request body." },
			{ status: 400 },
		);
	}

	console.log(`API Route: Starting extraction for URL: ${url}`);
	try {
		console.log("API Route: Fetching HTML for extraction...");
		const response = await axios.get(url, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				Accept: "text/html,application/xhtml+xml",
			},
			timeout: 15000,
		});
		const html = response.data;
		console.log("API Route: HTML fetched. Extracting content...");
		const article = await extract(html);
		if (article && article.content) {
			console.log("API Route: Content extracted successfully.");

			// Clean up the extracted content
			let cleanContent = article.content;

			// Remove HTML tags
			cleanContent = cleanContent.replace(/<[^>]*>/g, "");

			// Replace HTML entities
			cleanContent = cleanContent
				.replace(/&nbsp;/g, " ")
				.replace(/&amp;/g, "&")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&quot;/g, '"')
				.replace(/&#39;/g, "'");

			// Remove multiple consecutive line breaks and spaces
			cleanContent = cleanContent
				.replace(/(\r\n|\n|\r){2,}/g, "\n\n")
				.replace(/[ \t]+/g, " ")
				.trim();

			console.log("API Route: Content cleaned of HTML tags and entities.");
			return NextResponse.json({ data: cleanContent });
		} else {
			console.warn(
				"API Route: Could not extract content using library for URL:",
				url,
			);
			return NextResponse.json(
				{
					error:
						"Could not extract main content from this page (structure might be unsupported).",
				},
				{ status: 422 },
			);
		}
	} catch (error: unknown) {
		console.error(`API Route CATCH block in /api/extract for ${url}:`, error);
		// A single unreachable or unparseable article is a routine per-request
		// outcome (the target site blocked us, timed out, or 404'd), not a server
		// crash. Classify it so the UI doesn't read like the service is broken.
		let errorMessage = "Couldn't read this article. Try another source.";
		let statusCode = 422;
		if (axios.isAxiosError(error)) {
			if (error.response) {
				const status = error.response.status;
				if (status === 401 || status === 403) {
					errorMessage =
						"This site blocks automated access or requires a subscription.";
				} else if (status === 404) {
					errorMessage = "This article could not be found (404).";
				} else {
					errorMessage = `The source site returned an error (${status}).`;
				}
				statusCode = 422;
			} else {
				errorMessage =
					"The source site took too long to respond or was unreachable.";
				statusCode = 504;
			}
		} else if (error instanceof Error) {
			errorMessage = "Couldn't extract readable content from this article.";
			statusCode = 422;
		} else {
			errorMessage = "An unexpected error occurred during extraction.";
			statusCode = 500;
		}
		return NextResponse.json({ error: errorMessage }, { status: statusCode });
	}
}
