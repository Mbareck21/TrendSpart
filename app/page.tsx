"use client";

import React, { useState, useCallback } from "react";
import {
	GlassCard,
	GlassButton,
	GlassNavigation,
	GlassInput,
	GlassSelect,
	GlassSpinner,
	useGlassMorphism,
} from "@/components/glass";
import { motion, AnimatePresence } from "framer-motion";

// --- Define Interfaces ---
interface Article {
	title: string | null;
	description: string | null;
	url: string | null;
	source: string | null;
	publishedAt: string | null;
	imageUrl?: string | null;
	isSelected?: boolean;
}

// --- Define Types ---
type NewsCategory =
	| "technology"
	| "business"
	| "entertainment"
	| "general"
	| "health"
	| "science"
	| "sports";
type NewsCountry = "us" | "gb" | "ca" | "au" | "de" | "fr" | "jp" | "kr";
type ScriptTone =
	| "informative"
	| "excited"
	| "neutral"
	| "humorous"
	| "serious"
	| "casual";
type TtsVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

// Define specific types for API results for clarity
type TrendsResult = ApiResult<Article[]>;
type ExtractResult = ApiResult<string>;
type IdeasResult = ApiResult<string>;
type ScriptResult = ApiResult<string>;

interface ApiResult<T> {
	data?: T;
	error?: string;
}

// --- Constant values for UI ---
const newsCategories: NewsCategory[] = [
	"technology",
	"business",
	"entertainment",
	"general",
	"health",
	"science",
	"sports",
];
const newsCountries: NewsCountry[] = [
	"us",
	"gb",
	"ca",
	"au",
	"de",
	"fr",
	"jp",
	"kr",
];
const scriptTones: ScriptTone[] = [
	"informative",
	"excited",
	"neutral",
	"humorous",
	"serious",
	"casual",
];
const ttsVoices: TtsVoice[] = [
	"alloy",
	"echo",
	"fable",
	"onyx",
	"nova",
	"shimmer",
];

// --- Main Page Component ---
export default function Home() {
	// UI Controls State
	const [keywords, setKeywords] = useState<string>("");
	const [selectedCategory, setSelectedCategory] =
		useState<NewsCategory>("technology");
	const [selectedCountry, setSelectedCountry] = useState<NewsCountry>("us");
	const [selectedTone, setSelectedTone] = useState<ScriptTone>("informative");
	const [selectedVoice, setSelectedVoice] = useState<TtsVoice>("alloy");
	const [scriptDuration, setScriptDuration] = useState<number>(90);

	// Loading and Workflow State
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [loadingMessage, setLoadingMessage] = useState<string>("");
	const [trends, setTrends] = useState<Article[]>([]);
	const [trendsError, setTrendsError] = useState<string | null>(null);
	const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
	const [extractedText, setExtractedText] = useState<string | null>(null);
	const [extractError, setExtractError] = useState<string | null>(null);
	const [generatedIdeas, setGeneratedIdeas] = useState<string | null>(null);
	const [ideasError, setIdeasError] = useState<string | null>(null);
	const [finalScript, setFinalScript] = useState<string | null>(null);
	const [scriptError, setScriptError] = useState<string | null>(null);
	const [audioStatus, setAudioStatus] = useState<string | null>(null);
	const [audioError, setAudioError] = useState<string | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);

	// --- Helper Functions ---
	const updateLoading = (loading: boolean, message: string = "") => {
		setIsLoading(loading);
		setLoadingMessage(message);
	};

	const resetDownstream = useCallback((level: number) => {
		console.log(`Resetting downstream from level ${level}`);
		if (level <= 1) {
			setExtractedText(null);
			setExtractError(null);
			setSelectedUrl(null);
		}
		if (level <= 2) {
			setGeneratedIdeas(null);
			setIdeasError(null);
		}
		if (level <= 3) {
			setFinalScript(null);
			setScriptError(null);
		}
		if (level <= 4) {
			setAudioStatus(null);
			setAudioError(null);
		}
		if (level <= 1) {
			setTrends((prev) => prev.map((t) => ({ ...t, isSelected: false })));
		}
	}, []);

	// --- API Call Functions ---

	// Agent 1: Find Trends
	const handleFindTrends = useCallback(
		async (useKeywords: boolean = false) => {
			updateLoading(true, "Finding news trends...");
			setTrends([]);
			setTrendsError(null);
			resetDownstream(1);
			const params = new URLSearchParams();
			if (useKeywords && keywords.trim()) {
				params.append("keywords", keywords.trim());
			} else {
				params.append("category", selectedCategory);
				params.append("country", selectedCountry);
			}
			params.append("limit", "15");
			try {
				const response = await fetch(`/api/trends?${params.toString()}`);
				const result: TrendsResult = await response.json();
				if (!response.ok || result.error) {
					throw new Error(
						result.error || `HTTP error! status: ${response.status}`,
					);
				}
				setTrends(result.data || []);
			} catch (error) {
				setTrendsError(error instanceof Error ? error.message : String(error));
			} finally {
				updateLoading(false);
			}
		},
		[keywords, selectedCategory, selectedCountry, resetDownstream],
	);

	// Agent 2: Extract Content
	const handleExtractContent = useCallback(
		async (url: string | null, index: number) => {
			if (!url) return;
			updateLoading(true, `Extracting content...`);
			setExtractedText(null);
			setExtractError(null);
			setSelectedUrl(url);
			resetDownstream(2);
			setTrends((prev) =>
				prev.map((t, i) => ({ ...t, isSelected: i === index })),
			);
			try {
				const response = await fetch("/api/extract", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ url }),
				});
				const result: ExtractResult = await response.json();
				if (!response.ok || result.error) {
					throw new Error(
						result.error || `HTTP error! status: ${response.status}`,
					);
				}
				setExtractedText(result.data || null);
			} catch (error) {
				setExtractError(error instanceof Error ? error.message : String(error));
			} finally {
				updateLoading(false);
			}
		},
		[resetDownstream],
	);

	// Agent 3: Generate Ideas
	const handleGenerateIdeas = useCallback(async () => {
		if (!extractedText) return;
		updateLoading(true, "Generating ideas with AI...");
		setGeneratedIdeas(null);
		setIdeasError(null);
		resetDownstream(3);
		try {
			const response = await fetch("/api/ideas", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: extractedText }),
			});
			const result: IdeasResult = await response.json();
			if (!response.ok || result.error) {
				throw new Error(
					result.error || `HTTP error! status: ${response.status}`,
				);
			}
			setGeneratedIdeas(result.data || null);
		} catch (error) {
			setIdeasError(error instanceof Error ? error.message : String(error));
		} finally {
			updateLoading(false);
		}
	}, [extractedText, resetDownstream]);

	// Agent 4: Write Script
	const handleWriteScript = useCallback(async () => {
		if (!extractedText || !generatedIdeas) return;
		updateLoading(true, `Writing script (~${scriptDuration}s)...`);
		setFinalScript(null);
		setScriptError(null);
		resetDownstream(4);
		try {
			const response = await fetch("/api/script", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text: extractedText,
					ideas: generatedIdeas,
					duration: scriptDuration,
					tone: selectedTone,
				}),
			});
			const result: ScriptResult = await response.json();
			if (!response.ok || result.error) {
				throw new Error(
					result.error || `HTTP error! status: ${response.status}`,
				);
			}
			setFinalScript(result.data || null);
		} catch (error) {
			setScriptError(error instanceof Error ? error.message : String(error));
		} finally {
			updateLoading(false);
		}
	}, [
		extractedText,
		generatedIdeas,
		scriptDuration,
		selectedTone,
		resetDownstream,
	]);

	// Agent 5: Generate Audio
	const handleGenerateAudio = useCallback(async () => {
		if (!finalScript) return;
		updateLoading(true, "Generating audio with OpenAI TTS...");
		setAudioStatus("Generating audio...");
		setAudioError(null);

		// Clear any existing audio URL
		if (audioUrl) {
			window.URL.revokeObjectURL(audioUrl);
			setAudioUrl(null);
		}

		try {
			const response = await fetch("/api/audio", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					scriptText: finalScript,
					ttsOptions: {
						voice: selectedVoice,
						model: "tts-1",
					},
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			setAudioUrl(url);
			setAudioStatus(`✅ Audio generated successfully!`);
		} catch (error) {
			setAudioError(error instanceof Error ? error.message : String(error));
		} finally {
			updateLoading(false);
		}
	}, [finalScript, selectedVoice, audioUrl]);

	// Handle audio download separately
	const handleDownloadAudio = useCallback(() => {
		if (!audioUrl) return;

		const a = document.createElement("a");
		a.style.display = "none";
		a.href = audioUrl;
		a.download = `trendspark_audio_${Date.now()}.mp3`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		setAudioStatus(`✅ Audio download started! Check browser downloads.`);
	}, [audioUrl]);

	// --- Render Component ---
	return (
		<main className='container mx-auto px-4 py-8 max-w-full'>
			<GlassNavigation
				title='TrendSpark ✨'
				className='mb-6'
				sticky
				rightContent={
					isLoading && (
						<div className='flex items-center gap-2'>
							<div className='w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin' />
							<span>{loadingMessage}</span>
						</div>
					)
				}
			/>

			{/* Search Controls */}
			<motion.div
				className='glass-pattern-dots p-6 rounded-xl mb-8'
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}>
				<h2 className='text-xl font-semibold mb-4'>Find Trending Content</h2>

				<div className='controls-container flex flex-wrap justify-center items-center gap-x-4 gap-y-5'>
					{/* Keyword Search */}
					<div className='control-group flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto'>
						<GlassInput
							id='keywords-input'
							label='Search Topic:'
							value={keywords}
							onChange={(e) => setKeywords(e.target.value)}
							placeholder='Enter keywords...'
							disabled={isLoading}
							className='w-full sm:w-64'
						/>
						<GlassButton
							onClick={() => handleFindTrends(true)}
							disabled={isLoading || !keywords.trim()}
							variant='primary'
							icon={
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'>
									<circle cx='11' cy='11' r='8'></circle>
									<line x1='21' y1='21' x2='16.65' y2='16.65'></line>
								</svg>
							}>
							Search
						</GlassButton>
					</div>

					<div className='w-full md:w-auto flex items-center justify-center'>
						<span className='px-4 py-2 rounded-full bg-white/10 text-sm'>
							OR
						</span>
					</div>

					{/* Top Headlines Controls */}
					<div className='control-group flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto'>
						<GlassSelect
							id='category-select'
							label='Category:'
							value={selectedCategory}
							onChange={(e) =>
								setSelectedCategory(e.target.value as NewsCategory)
							}
							options={newsCategories.map((cat) => ({
								value: cat,
								label: cat.charAt(0).toUpperCase() + cat.slice(1),
							}))}
							disabled={isLoading}
						/>

						<GlassSelect
							id='country-select'
							label='Country:'
							value={selectedCountry}
							onChange={(e) =>
								setSelectedCountry(e.target.value as NewsCountry)
							}
							options={newsCountries.map((country) => ({
								value: country,
								label: country.toUpperCase(),
							}))}
							disabled={isLoading}
						/>

						<GlassButton
							onClick={() => {
								setKeywords("");
								handleFindTrends(false);
							}}
							disabled={isLoading}
							variant='primary'
							icon={
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'>
									<path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'></path>
									<polyline points='22,6 12,13 2,6'></polyline>
								</svg>
							}>
							Get Headlines
						</GlassButton>
					</div>
				</div>
			</motion.div>

			{/* Main Content Grid */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				{/* Column 1: Results */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}>
					<GlassCard className='h-full flex flex-col'>
						<h2 className='text-xl font-semibold mb-3 text-center pb-2 border-b border-white/10 dark:border-black/30'>
							Results
						</h2>

						<div className='flex-grow overflow-y-auto h-96 space-y-3 pr-2 -mr-2'>
							{/* Skeleton Loader */}
							{isLoading &&
								!trends.length &&
								!trendsError &&
								loadingMessage.includes("Finding") && (
									<div className='space-y-3 animate-pulse'>
										{[...Array(5)].map((_, i) => (
											<div
												key={i}
												className='p-3 border border-white/5 dark:border-black/20 rounded-md'>
												<div className='h-4 bg-white/10 dark:bg-black/30 rounded w-3/4 mb-2'></div>
												<div className='h-3 bg-white/5 dark:bg-black/20 rounded w-1/2 mb-3'></div>
												<div className='h-8 bg-white/5 dark:bg-black/20 rounded w-full'></div>
											</div>
										))}
									</div>
								)}

							{/* Error/Empty/Data */}
							{trendsError && (
								<p className='text-red-400 font-medium text-center p-4'>
									{trendsError}
								</p>
							)}

							{!isLoading && !trendsError && trends.length === 0 && (
								<p className='text-center p-4 opacity-60'>
									Use controls above to find trends...
								</p>
							)}

							<AnimatePresence>
								{trends.map((article, index) => (
									<motion.div
										key={article.url || index}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}>
										<GlassCard
											isSelected={selectedUrl === article.url}
											className='mb-3'>
											<h3 className='font-semibold text-sm mb-1'>
												{article.title}
											</h3>
											<p className='text-xs opacity-75 mb-2'>
												{article.source} (
												{article.publishedAt
													? new Date(article.publishedAt).toLocaleDateString()
													: "N/A"}
												)
											</p>
											<div className='flex gap-2 mt-3'>
												<GlassButton
													onClick={() =>
														handleExtractContent(article.url, index)
													}
													disabled={isLoading}
													size='sm'
													variant='primary'>
													Extract Content
												</GlassButton>

												{article.url && (
													<GlassButton
														as='a'
														href={article.url}
														target='_blank'
														rel='noopener noreferrer'
														size='sm'
														variant='outlined'>
														Read Original
													</GlassButton>
												)}
											</div>
										</GlassCard>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</GlassCard>
				</motion.div>

				{/* Column 2: Extracted Content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}>
					<GlassCard className='h-full flex flex-col'>
						<h2 className='text-xl font-semibold mb-3 text-center pb-2 border-b border-white/10 dark:border-black/30'>
							Extracted Content
						</h2>

						<div className='mb-3 flex justify-end'>
							<GlassButton
								onClick={handleGenerateIdeas}
								disabled={isLoading || !extractedText}
								variant={extractedText ? "primary" : "secondary"}>
								Generate Ideas
							</GlassButton>
						</div>

						<div className='content-output flex-grow overflow-y-auto h-80'>
							{isLoading && loadingMessage.includes("Extracting") && (
								<div className='h-full flex items-center justify-center'>
									<GlassSpinner size='md' label='Extracting content...' />
								</div>
							)}

							{extractError && (
								<div className='text-red-400 font-medium text-center p-4 bg-red-500/10 border border-red-500/20 rounded-md'>
									{extractError}
								</div>
							)}

							{!isLoading && !extractedText && !extractError && (
								<div className='h-full flex flex-col items-center justify-center text-center p-4 opacity-60'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='40'
										height='40'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'>
										<path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path>
										<polyline points='14 2 14 8 20 8'></polyline>
										<line x1='16' y1='13' x2='8' y2='13'></line>
										<line x1='16' y1='17' x2='8' y2='17'></line>
										<polygon points='10 9 9 9 8 9'></polygon>
									</svg>
									<p className='mt-2'>Select an article to extract content</p>
								</div>
							)}

							{extractedText && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.5 }}>
									<pre className='whitespace-pre-wrap break-words font-sans text-sm p-2'>
										{extractedText}
									</pre>
								</motion.div>
							)}
						</div>
					</GlassCard>
				</motion.div>

				{/* Column 3: Generated Ideas */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}>
					<GlassCard className='h-full flex flex-col'>
						<h2 className='text-xl font-semibold mb-3 text-center pb-2 border-b border-white/10 dark:border-black/30'>
							Generated Ideas
						</h2>

						<div className='mb-3 space-y-3'>
							<div className='flex items-center gap-3 flex-wrap'>
								<GlassInput
									id='duration-input'
									label='Duration(s):'
									type='number'
									value={scriptDuration}
									onChange={(e) =>
										setScriptDuration(parseInt(e.target.value, 10))
									}
									min={15}
									max={180}
									step={15}
									className='w-24'
								/>

								<GlassSelect
									id='tone-select'
									label='Tone:'
									value={selectedTone}
									onChange={(e) =>
										setSelectedTone(e.target.value as ScriptTone)
									}
									options={scriptTones.map((tone) => ({
										value: tone,
										label: tone.charAt(0).toUpperCase() + tone.slice(1),
									}))}
									disabled={isLoading || !generatedIdeas}
								/>
							</div>

							<div className='flex justify-end'>
								<GlassButton
									onClick={handleWriteScript}
									disabled={isLoading || !generatedIdeas}
									variant={generatedIdeas ? "primary" : "secondary"}>
									Write Final Script
								</GlassButton>
							</div>
						</div>

						<div className='content-output flex-grow overflow-y-auto h-80'>
							{isLoading && loadingMessage.includes("Generating ideas") && (
								<div className='h-full flex items-center justify-center'>
									<GlassSpinner size='md' label='Generating ideas...' />
								</div>
							)}

							{ideasError && (
								<div className='text-red-400 font-medium text-center p-4 bg-red-500/10 border border-red-500/20 rounded-md'>
									{ideasError}
								</div>
							)}

							{!isLoading && !generatedIdeas && !ideasError && (
								<div className='h-full flex flex-col items-center justify-center text-center p-4 opacity-60'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='40'
										height='40'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'>
										<circle cx='12' cy='12' r='10'></circle>
										<line x1='12' y1='8' x2='12' y2='12'></line>
										<line x1='12' y1='16' x2='12.01' y2='16'></line>
									</svg>
									<p className='mt-2'>
										Extract content first, then generate ideas
									</p>
								</div>
							)}

							{generatedIdeas && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.5 }}>
									<pre className='whitespace-pre-wrap break-words font-sans text-sm p-2'>
										{generatedIdeas}
									</pre>
								</motion.div>
							)}
						</div>
					</GlassCard>
				</motion.div>

				{/* Column 4: Final Script & Audio */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}>
					<GlassCard className='h-full flex flex-col'>
						<h2 className='text-xl font-semibold mb-3 text-center pb-2 border-b border-white/10 dark:border-black/30'>
							Final Script & Audio
						</h2>

						<div className='mb-3 space-y-3'>
							<GlassSelect
								id='voice-select'
								label='Voice:'
								value={selectedVoice}
								onChange={(e) => setSelectedVoice(e.target.value as TtsVoice)}
								options={ttsVoices.map((voice) => ({
									value: voice,
									label: voice.charAt(0).toUpperCase() + voice.slice(1),
								}))}
								disabled={isLoading || !finalScript}
							/>

							<div className='flex justify-end'>
								<GlassButton
									onClick={handleGenerateAudio}
									disabled={isLoading || !finalScript}
									variant={finalScript ? "primary" : "secondary"}
									icon={
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'>
											<path d='M18 8a6 6 0 0 1 0 12h-2a6 6 0 0 1 0-12h2'></path>
											<rect x='2' y='8' width='4' height='12' rx='1'></rect>
											<path d='M22 14h-4'></path>
										</svg>
									}>
									Generate Audio
								</GlassButton>
							</div>

							{/* Audio Player */}
							{audioUrl && (
								<motion.div
									className='audio-player-container my-3 p-2 border border-white/10 dark:border-black/20 rounded-md'
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}>
									<audio
										className='w-full my-2'
										src={audioUrl}
										controls
										controlsList='nodownload'
										preload='metadata'
									/>
									<div className='flex justify-end mt-2'>
										<GlassButton
											onClick={handleDownloadAudio}
											size='sm'
											variant='primary'
											icon={
												<svg
													xmlns='http://www.w3.org/2000/svg'
													width='14'
													height='14'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'>
													<path d='M12 17l-5-5h10l-5 5z'></path>
													<path d='M12 3v14'></path>
													<path d='M5 21h14'></path>
												</svg>
											}>
											Download Audio
										</GlassButton>
									</div>
								</motion.div>
							)}

							<div className='status-box text-center min-h-[2em]'>
								{isLoading && loadingMessage.includes("audio") && (
									<p className='text-sm opacity-75'>
										<span className='inline-block animate-pulse'>⏳</span>{" "}
										{loadingMessage}
									</p>
								)}
								{audioError && (
									<p className='text-red-400 font-medium text-sm'>
										{audioError}
									</p>
								)}
								{audioStatus && !audioError && (
									<p className='text-green-400 font-medium text-sm'>
										{audioStatus}
									</p>
								)}
							</div>
						</div>

						<div className='content-output flex-grow overflow-y-auto h-80'>
							{isLoading && loadingMessage.includes("Writing script") && (
								<div className='h-full flex items-center justify-center'>
									<GlassSpinner size='md' label='Writing script...' />
								</div>
							)}

							{scriptError && (
								<div className='text-red-400 font-medium text-center p-4 bg-red-500/10 border border-red-500/20 rounded-md'>
									{scriptError}
								</div>
							)}

							{!isLoading && !finalScript && !scriptError && (
								<div className='h-full flex flex-col items-center justify-center text-center p-4 opacity-60'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='40'
										height='40'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'>
										<polyline points='3 6 5 6 21 6'></polyline>
										<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'></path>
										<line x1='10' y1='11' x2='10' y2='17'></line>
										<line x1='14' y1='11' x2='14' y2='17'></line>
									</svg>
									<p className='mt-2'>
										Generate ideas first, then write a script
									</p>
								</div>
							)}

							{finalScript && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.5 }}>
									<pre className='whitespace-pre-wrap break-words font-sans text-sm p-2'>
										{finalScript}
									</pre>
								</motion.div>
							)}
						</div>
					</GlassCard>
				</motion.div>
			</div>
		</main>
	);
}
