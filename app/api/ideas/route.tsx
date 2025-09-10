// src/app/api/ideas/route.ts
import { type NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

interface IdeasRequestBody {
	text?: string;
}
interface IdeasApiResponse {
	data?: string | null;
	error?: string;
}

export async function POST(
	request: NextRequest,
): Promise<NextResponse<IdeasApiResponse>> {
	console.log("API Route: /api/ideas received POST request");

	// Check if Groq client is initialized
	if (!groq) {
		console.error(
			"API Route: Groq API client not initialized. Check GROQ_API_KEY in .env file.",
		);
		return NextResponse.json(
			{ error: "AI service not configured. Check server configuration." },
			{ status: 500 },
		);
	}

	// Parse request body
	let requestBody: IdeasRequestBody;
	try {
		requestBody = await request.json();
	} catch (e) {
		console.error("API Route: Error parsing request body:", e);
		return NextResponse.json(
			{ error: "Invalid JSON in request body" },
			{ status: 400 },
		);
	}
	// Validate article content
	const articleContent = requestBody.text;
	if (
		!articleContent ||
		typeof articleContent !== "string" ||
		articleContent.trim() === ""
	) {
		console.error("API Route: Missing or empty article content");
		return NextResponse.json(
			{ error: "Missing or empty article content" },
			{ status: 400 },
		);
	}

	console.log("API Route: Starting idea generation...");

	// Truncate long content for API limits
	const maxChars = 7000; // Max input chars for prompt safety
	let processedContent = articleContent;
	if (articleContent.length > maxChars) {
		console.log(
			`API Route: Truncating content for Groq Ideas (${articleContent.length} -> ${maxChars})`,
		);
		const lastPeriod = articleContent.lastIndexOf(".", maxChars);
		processedContent = articleContent.substring(
			0,
			lastPeriod > maxChars * 0.8 ? lastPeriod + 1 : maxChars,
		);
	}

	// Create the prompt for idea generation
	const prompt = `
Based on the following news article content, generate ideas for a short (15-45 second) TikTok video. Provide the following:
1.  **Catchy Hook:** A short, attention-grabbing opening line (max 10 words).
2.  **Key Talking Points:** 3 concise bullet points summarizing the core message or most interesting aspects for a TikTok audience.
3.  **Call to Action (CTA):** A simple suggestion for viewers (e.g., "What do you think?", "Follow for more!", "Check the link in bio!").
4.  **Video Title Ideas:** 3 distinct, short, engaging title options suitable for TikTok.

Format the output clearly with headings for each section (use markdown bold for headings like **Catchy Hook:**). Ensure the ideas are directly based on the provided content.

**Article Content:**
---
${processedContent}
---
`;

	try {
		console.log("API Route: Sending request to Groq API for ideas...");
		const chatCompletion = await groq.chat.completions.create({
			messages: [
				{
					role: "system",
					content:
						"You are a helpful assistant creating TikTok video ideas from news text.",
				},
				{ role: "user", content: prompt },
			],
			model: "llama-3.1-8b-instant",
			temperature: 0.7,
			max_tokens: 350,
			top_p: 1,
			stream: false,
		});

		const ideas = chatCompletion.choices[0]?.message?.content?.trim();
		if (ideas) {
			console.log("API Route: Groq ideas received successfully.");
			return NextResponse.json({ data: ideas });
		} else {
			console.error("API Route: Could not extract ideas from Groq response");
			return NextResponse.json(
				{ error: "Failed to parse ideas from AI response." },
				{ status: 500 },
			);
		}
	} catch (error: unknown) {
		console.error("API Route CATCH block in /api/ideas. Error:", error);

		let errorMessage = "Failed to generate ideas. Please try again later.";
		let statusCode = 500;

		// Handle Groq API errors specifically
		if (error instanceof Groq.APIError) {
			errorMessage = `Groq API Error (${error.status}): ${error.message}`;
			if (error.status === 401) errorMessage += " Check Groq API Key.";
			if (error.status === 429) errorMessage += " Rate limit hit.";
			statusCode = error.status;
		} else if (error instanceof Error) {
			errorMessage = `Error: ${error.message}`;
		}

		return NextResponse.json({ error: errorMessage }, { status: statusCode });
	}
}
