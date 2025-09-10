// src/app/api/trends/route.ts
import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = "https://newsapi.org/v2/";

interface NewsApiParams {
	apiKey: string | undefined;
	pageSize: number;
	q?: string;
	country?: string;
	category?: string;
	sortBy?: string;
	language?: string;
}

interface Article {
	title: string | null;
	description: string | null;
	url: string | null;
	source: string | null;
	publishedAt: string | null;
	author: string | null;
	imageUrl: string | null;
}

interface ApiResponse {
	data?: Article[];
	error?: string;
}

export async function GET(
	request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
	console.log("API Route: /api/trends received GET request");

	if (!NEWS_API_KEY) {
		console.error("API Route Error: NEWS_API_KEY not found.");
		return NextResponse.json(
			{ error: "Server configuration error: News API Key is missing." },
			{ status: 500 },
		);
	}

	const searchParams = request.nextUrl.searchParams;
	const keywords = searchParams.get("keywords") || "";
	const country = searchParams.get("country") || "us"; // Default country
	const category = searchParams.get("category") || "technology"; // Default category
	const limit = parseInt(searchParams.get("limit") || "10", 10);
	const sortBy =
		searchParams.get("sortBy") || (keywords ? "relevancy" : "publishedAt"); // Adjust sort based on mode

	console.log("API Route Params:", {
		keywords,
		country,
		category,
		limit,
		sortBy,
	});

	let apiUrl: string;
	const params: NewsApiParams = {
		apiKey: NEWS_API_KEY,
		pageSize: limit,
	};

	// Determine endpoint and parameters based on keywords
	if (keywords && keywords.trim() !== "") {
		apiUrl = NEWS_API_BASE_URL + "everything";
		params.q = keywords.trim();
		params.sortBy = sortBy;
		params.language = "en";
		console.log(`API Route: Using 'everything' with params:`, params);
	} else {
		apiUrl = NEWS_API_BASE_URL + "top-headlines";
		params.country = country;
		params.category = category;
		console.log(`API Route: Using 'top-headlines' with params:`, params);
	}

	try {
		const response = await axios.get(apiUrl, { params, timeout: 12000 });
		console.log(
			"API Route: Axios NewsAPI request completed. Status:",
			response.status,
		);

		if (response.data && response.data.status === "ok") {
			const articles = response.data.articles || [];
			console.log(
				`API Route: NewsAPI status OK. Articles count: ${articles.length}`,
			);
			interface NewsAPIArticle {
				title?: string;
				description?: string;
				url?: string;
				source?: { name?: string };
				publishedAt?: string;
				author?: string;
				urlToImage?: string;
			}

			const processedArticles: Article[] = articles.map((article: NewsAPIArticle) => ({
				title: article.title || null,
				description: article.description || null,
				url: article.url || null,
				source: article.source?.name || null,
				publishedAt: article.publishedAt || null,
				author: article.author || null,
				imageUrl: article.urlToImage || null,
			}));
			console.log("API Route: Articles processed.");
			return NextResponse.json({ data: processedArticles });
		} else {
			console.error(
				"API Route: NewsAPI returned non-'ok' status:",
				response.data?.status,
				response.data?.message,
			);
			return NextResponse.json(
				{
					error:
						response.data?.message ||
						`API returned status: ${response.data?.status}`,
				},
				{ status: response.status || 500 },
			);
		}
	} catch (error: unknown) {
		// Use unknown type
		console.error("API Route CATCH block in /api/trends. Error:", error);
		let errorMessage = "An unexpected error occurred while fetching news.";
		let statusCode = 500;

		if (axios.isAxiosError(error)) {
			// Check if it's an Axios error
			if (error.response) {
				// Server responded with non-2xx status
				statusCode = error.response.status;
				errorMessage = `NewsAPI request failed with status ${statusCode}.`;
				if (statusCode === 401)
					errorMessage = "Unauthorized - Check News API Key.";
				else if (statusCode === 429)
					errorMessage = "Too Many Requests - NewsAPI rate limit hit.";
				else if (statusCode === 400)
					errorMessage = "Bad Request (400) to NewsAPI: Check parameters.";
				else if (statusCode === 426)
					errorMessage = "Upgrade Required (426): NewsAPI requires HTTPS.";
				else if (error.response.data?.message)
					errorMessage = error.response.data.message;
				console.error("API Route: Axios Response Error:", errorMessage);
			} else if (error.request) {
				// Request made but no response received
				console.error("API Route: Axios request error (no response).");
				errorMessage = "Network error or timeout contacting News API.";
				statusCode = 504; // Gateway Timeout
			} else {
				// Other Axios setup error
				console.error("API Route: Axios setup error:", error.message);
				errorMessage = `Axios setup error: ${error.message}`;
			}
		} else if (error instanceof Error) {
			// Handle standard JavaScript errors
			console.error(
				"API Route: Non-Axios error in /api/trends:",
				error.message,
			);
			errorMessage = error.message;
		} else {
			console.error("API Route: Unknown error type in /api/trends:", error);
			errorMessage = "An unknown server error occurred.";
		}
		return NextResponse.json({ error: errorMessage }, { status: statusCode });
	}
}
