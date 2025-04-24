// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../components/glass/glass-styles.css";
import { GlassMorphismProviderWrapper } from "../components/glass/GlassMorphismWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "TrendSpark - AI Content Generator",
	description: "Find trends and generate scripts and audio.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${inter.className} min-h-screen`}>
				<GlassMorphismProviderWrapper>
					<div className='glass-animated-bg min-h-screen'>{children}</div>
				</GlassMorphismProviderWrapper>
			</body>
		</html>
	);
}
