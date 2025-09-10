import { type NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

interface ScriptRequestBody {
	text?: string; // Updated to match frontend parameter name
	ideas?: string; // Updated to match frontend parameter name
	tone?: string; // Direct parameter from frontend
	duration?: number; // Direct parameter from frontend
}

interface ScriptApiResponse {
	data?: string | null; // Final script text
	error?: string;
}

export async function POST(
	request: NextRequest,
): Promise<NextResponse<ScriptApiResponse>> {
	console.log("API Route: /api/script received POST request");

	if (!groq) {
		console.error(
			"API Route Error: Groq client not initialized (API Key missing?).",
		);
		return NextResponse.json(
			{ error: "Server configuration error: AI service unavailable." },
			{ status: 503 },
		);
	}

	let requestBody: ScriptRequestBody;
	try {
		requestBody = await request.json();
	} catch (error) {
		console.error("API Route Error: Invalid JSON body in /api/script", error);
		return NextResponse.json(
			{
				error:
					"Invalid request body. Expecting JSON with 'text', 'ideas', 'tone', and 'duration'.",
			},
			{ status: 400 },
		);
	}

	const {
		text,
		ideas,
		tone: requestTone,
		duration: requestDuration,
	} = requestBody;
	// Use provided values or defaults
	const tone = requestTone || "informative"; // Default tone
	const duration = requestDuration || 90; // Default duration 90s

	if (
		!text ||
		!ideas ||
		typeof text !== "string" ||
		typeof ideas !== "string"
	) {
		console.error("API Route Error: Missing or invalid 'text' or 'ideas'.");
		return NextResponse.json(
			{
				error: "Missing or invalid 'text' or 'ideas' in request body.",
			},
			{ status: 400 },
		);
	}

	console.log(
		`API Route: Starting script writing (Duration: ${duration}s, Tone: ${tone}).`,
	);

	// Truncate inputs
	const maxArticleChars = 6000;
	const maxIdeaChars = 1000;
	let processedArticle = text;
	let processedIdeas = ideas;
	if (text.length > maxArticleChars) {
		console.log(
			`API Route: Truncating article content for script writing (${text.length} -> ${maxArticleChars})`,
		);
		const lastPeriod = text.lastIndexOf(".", maxArticleChars);
		processedArticle = text.substring(
			0,
			lastPeriod > maxArticleChars * 0.8 ? lastPeriod + 1 : maxArticleChars,
		);
	}
	if (ideas.length > maxIdeaChars) {
		console.log(
			`API Route: Truncating content ideas for script writing (${ideas.length} -> ${maxIdeaChars})`,
		);
		processedIdeas = ideas.substring(0, maxIdeaChars);
	}

	const prompt = `
You are a scriptwriter creating concise and engaging voiceover scripts for short social media videos (like TikTok) based on news articles and provided creative ideas.

**Instructions:**
1.  Review the "Article Content" for factual information.
2.  Review the "Content Ideas" (hook, points, titles) for creative direction.
3.  Write a complete voiceover script, approximately **${duration} seconds** long when read aloud at a moderate pace. Adjust the level of detail and number of points covered to fit this duration. Aim for this length, but prioritize clarity and engagement.
4.  **Strongly incorporate** the provided "Catchy Hook" at the beginning and weave the "Key Talking Points" into the main body of the script. Ensure the script remains factually accurate according to the "Article Content".
5.  Maintain a **${tone}** tone throughout the script.
6.  End with the suggested "Call to Action (CTA)" from the ideas, or a similar one.
7.  **IMPORTANT: Your entire response MUST consist ONLY of the script text itself.** Do not include *any* other text, headings, explanations, introductory sentences (like "Here is the script..."), or concluding remarks. The output must be immediately ready for text-to-speech conversion.

**Article Content:**
---
${processedArticle}
---

**Content Ideas:**
---
${processedIdeas}
---

**Generated Script:**
`;

	// Estimate tokens needed based on duration
	const estimatedTokens = Math.ceil(duration * 3.3) + 150;
	const maxOutputTokens = Math.min(estimatedTokens, 1500);
	console.log(
		`API Route: Estimated max_tokens for script: ~${maxOutputTokens}`,
	);

	try {
		console.log("API Route: Sending request to Groq API to write script...");
		const chatCompletion = await groq.chat.completions.create({
			messages: [{ role: "user", content: prompt }],
			model: "llama-3.1-8b-instant", // Or another capable model
			temperature: 0.6,
			max_tokens: maxOutputTokens,
			top_p: 1,
			stream: false,
		});
		let finalScript = chatCompletion.choices[0]?.message?.content?.trim();
		if (finalScript) {
			console.log("API Route: Groq script received successfully.");
			// Cleanup
			if (finalScript.startsWith('"') && finalScript.endsWith('"')) {
				finalScript = finalScript.substring(1, finalScript.length - 1);
			}
			finalScript = finalScript.replace(/\*\*/g, "");

			// Enhanced pattern to catch more variations of introductory phrases
			const introPatterns = [
				/^here[']?s?\s+the\s+(final\s+)?script(\s*text)?\s*:/i,
				/^here\s+is\s+the\s+script\s*:/i,
				/^script\s*:/i,
				/^the\s+(final\s+)?script\s+is\s*:/i,
			];

			// Check all intro patterns
			for (const pattern of introPatterns) {
				if (pattern.test(finalScript.split("\n")[0])) {
					console.log("API Route: Removing preamble from script.");
					const lines = finalScript.split("\n");
					lines.shift();
					finalScript = lines.join("\n").trim();
					break;
				}
			}
			return NextResponse.json({ data: finalScript });
		} else {
			console.error(
				"API Route: Could not extract script from Groq response:",
				JSON.stringify(chatCompletion, null, 2),
			);
			return NextResponse.json(
				{ error: "Failed to parse script from AI response." },
				{ status: 500 },
			);
		}
	} catch (error: unknown) {
		// Use unknown type
		console.error("API Route CATCH block in /api/script. Error:", error);
		// Use similar error handling logic as /api/ideas route
		let errorMessage = `Groq API Error: Unknown`;
		let statusCode = 500;
		if (error instanceof Groq.APIError) {
			statusCode = error.status || 500;
			errorMessage = `Groq API Error (${statusCode}): ${error.message}`;
			if (statusCode === 401) errorMessage += " Check Groq API Key.";
			if (statusCode === 429) errorMessage += " Rate limit hit.";
			console.error("API Route: Groq SDK API Error:", errorMessage);
		} else if (error instanceof Error) {
			errorMessage = `Groq request failed: ${error.message}`;
			console.error("API Route: Groq SDK Non-API Error:", errorMessage);
		} else {
			console.error(
				"API Route: Unknown error type calling Groq for script:",
				error,
			);
			errorMessage = "An unknown error occurred calling the AI script service.";
		}
		return NextResponse.json({ error: errorMessage }, { status: statusCode });
	}
}
