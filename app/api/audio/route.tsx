// src/app/api/audio/route.ts
import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Define valid voice types based on OpenAI SDK
const validVoices = [
"alloy",
"echo",
"fable",
"onyx",
"nova",
"shimmer",
] as const;

type ValidVoice = typeof validVoices[number];

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
} catch {
console.error("API Route Error: Invalid JSON body in /api/audio");
return NextResponse.json(
{
error:
"Invalid request body. Expecting JSON with 'scriptText' and optional 'ttsOptions'.",
},
{ status: 400 },
);
}

// Validate request body
const scriptText = requestBody.scriptText;
if (!scriptText || typeof scriptText !== "string" || scriptText.trim() === "") {
console.error("API Route Error: Missing or invalid 'scriptText' in request body.");
return NextResponse.json(
{ error: "Missing or invalid 'scriptText' in request body." },
{ status: 400 },
);
}

// Extract TTS options from request body
const { ttsOptions = {} } = requestBody;
const voiceOption = (ttsOptions.voice || "nova") as ValidVoice;
const modelOption = ttsOptions.model || "tts-1";
// const speedOption = ttsOptions.speed || 1.0;

// Validate voice option
    const voice = voiceOption && validVoices.includes(voiceOption as ValidVoice) ? (voiceOption as ValidVoice) : "nova";

try {
console.log(`API Route: Generating audio with voice: ${voice}, model: ${modelOption}`);

// Generate speech
const mp3 = await openai.audio.speech.create({
model: modelOption,
voice,
input: scriptText,
});

// Get audio data as ArrayBuffer
const audioData = await mp3.arrayBuffer();

// Return audio as response
return new NextResponse(audioData, {
status: 200,
headers: {
"Content-Type": "audio/mpeg",
"Content-Length": audioData.byteLength.toString(),
},
});
} catch (error) {
console.error("API Route Error: Failed to generate audio:", error);
return NextResponse.json(
{ error: "Failed to generate audio. Please try again later." },
{ status: 500 },
);
}
}
