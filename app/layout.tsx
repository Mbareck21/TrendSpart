// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "../components/glass/glass-styles.css";
import { GlassMorphismProviderWrapper } from "../components/glass/GlassMorphismWrapper";
import Footer from "../components/Footer";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	weight: ["500", "600", "700"],
	variable: "--font-display",
	display: "swap",
});

export const metadata: Metadata = {
	title: "TrendSpark - AI Content Generator",
	description: "Find trends and generate scripts and audio.",
};

// Apply the saved/system theme class before first paint to avoid a flash of
// the wrong theme (FOUC). Mirrors the resolution logic in GlassMorphismContext.
const themeInitScript = `
(function () {
	try {
		var saved = localStorage.getItem('glassmorphismTheme');
		var dark = saved
			? !!JSON.parse(saved).isDarkMode
			: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		document.documentElement.classList.toggle('dark', dark);
	} catch (e) {}
})();
`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
			</head>
			<body
				className={`${inter.variable} ${spaceGrotesk.variable} ${inter.className} min-h-screen antialiased`}>
				<GlassMorphismProviderWrapper>
					<div className='glass-animated-bg min-h-screen'>
						{children}
						<Footer />
					</div>
				</GlassMorphismProviderWrapper>
			</body>
		</html>
	);
}
