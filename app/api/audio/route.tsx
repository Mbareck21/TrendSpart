// src/app/api/audio/route.ts
import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Define valid voice types based on OpenAI SDK
const validVoices: OpenAI.Audio.Speech.Voice[] = [
	"alloy",
	"echo",
	"fable",
	"onyx",
	"nova",
	"shimmer",
];

interface AudioRequestBody {
	scriptText?: string;
	ttsOptions?: {
		voice?: string; // Receive as string initially
		model?: string;
		// speed?: number;
	};
}

export async function POST(request: NextRequest) {
	// Return type is dynamic
	console.log("API Route: /api/audio received POST request");

	if (!openai) {
		console.error(
			"API Route Error: OpenAI client not initialized (API Key missing?).",
		);
		return NextResponse.json(
			{ error: "Server configuration error: Audio service unavailable." },
			{ status: 503 },
		);
	}

	let requestBody: AudioRequestBody;
	try {
		requestBody = await request.json();
	} catch (e) {
		console.error("API Route Error: Invalid JSON body in /api/audio");
		return NextResponse.json(
			{
				error:
					"Invalid request body. Expecting JSON with 'scriptText' and optional 'ttsOptions'.",
			},
			{ status: 400 },
		);
	}

	const scriptText = requestBody.scriptText;
	// Validate and select voice
	let voice: OpenAI.Audio.Speech.Voice = "alloy"; // Default voice
	const requestedVoice = requestBody.ttsOptions?.voice;
	if (requestedVoice && (validVoices as string[]).includes(requestedVoice)) {
		// Cast to the specific SDK type after validation
		voice = requestedVoice as OpenAI.Audio.Speech.Voice;
	} else if (requestedVoice) {
		console.warn(
			`API Route: Invalid voice '${requestedVoice}' provided. Falling back to 'alloy'.`,
		);
	}

	const model = requestBody.ttsOptions?.model || "tts-1"; // Default model

	if (
		!scriptText ||
		typeof scriptText !== "string" ||
		scriptText.trim() === ""
	) {
		console.error("API Route Error: Missing or invalid 'scriptText'.");
		return NextResponse.json(
			{ error: "Missing or invalid 'scriptText' property in request body." },
			{ status: 400 },
		);
	}

	let textToSpeak = scriptText.trim();
	if (textToSpeak.length > 4000) {
		console.warn(
			`API Route Warning: Script text long (${textToSpeak.length} chars), truncating for TTS.`,
		);
		textToSpeak = textToSpeak.substring(0, 4000);
	}

	try {
		console.log(
			`API Route: Sending request to OpenAI TTS API (Voice: ${voice}, Model: ${model})...`,
		);

		const mp3 = await openai.audio.speech.create({
			model: model,
			voice: voice, // Use validated voice
			input: textToSpeak,
			response_format: "mp3",
		});

		console.log("API Route: OpenAI TTS stream received.");

		if (!mp3.body) {
			console.error("API Route Error: OpenAI response body is null.");
			return NextResponse.json(
				{ error: "Failed to get audio stream from OpenAI." },
				{ status: 500 },
			);
		}

		// Stream the audio back to the client
		const headers = new Headers();
		headers.set("Content-Type", "audio/mpeg");
		headers.set(
			"Content-Disposition",
			`attachment; filename="trendspark_audio_${Date.now()}.mp3"`,
		);

		return new NextResponse(mp3.body, {
			status: 200,
			headers: headers,
		});
	} catch (error: unknown) {
		// Use unknown type
		console.error("API Route CATCH block in /api/audio. Error:", error);
		let errorMessage = `OpenAI TTS Error: Unknown`;
		let statusCode = 500;
		if (error instanceof OpenAI.APIError) {
			// Check specific SDK error type
			statusCode = error.status || 500;
			errorMessage = `OpenAI API Error (${statusCode}): ${error.message}`;
			if (statusCode === 401) errorMessage += " Check OpenAI API Key.";
			if (statusCode === 429) errorMessage += " Rate limit/Quota hit.";
			console.error("API Route: OpenAI SDK API Error:", errorMessage);
		} else if (error instanceof Error) {
			// Standard JS Error
			errorMessage = `OpenAI TTS request failed: ${error.message}`;
			console.error("API Route: OpenAI SDK Non-API Error:", errorMessage);
		} else {
			console.error("API Route: Unknown error type calling OpenAI TTS:", error);
			errorMessage =
				"An unknown server error occurred during audio generation.";
		}
		// Return error as JSON for TTS failures
		return NextResponse.json({ error: errorMessage }, { status: statusCode });
	}
}
