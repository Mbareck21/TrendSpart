// components/glass/GlassMorphismContext.tsx
"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

// Define Theme interface based on our architecture
export interface GlassMorphismTheme {
	blurIntensity: "sm" | "md" | "lg" | "xl" | "2xl";
	baseOpacity: number;
	colorPalette: {
		background: string;
		text: string;
		textMuted: string;
		border: string;
		accent: string;
		accentSolid: string;
	};
	// Layered surface scale for clear depth/hierarchy
	surface: {
		base: string; // primary card background
		raised: string; // nested / elevated panels
		sunken: string; // recessed areas: inputs, content output
	};
	elevation: string; // box-shadow for resting cards
	isDarkMode: boolean;
}

// Define the base props all glass components will inherit
export interface GlassComponentProps {
	customBlur?: "sm" | "md" | "lg" | "xl" | "2xl";
	customOpacity?: number;
	customBorder?: string;
	animation?: boolean;
	className?: string;
}

// Default theme values
const lightTheme: GlassMorphismTheme = {
	blurIntensity: "lg",
	baseOpacity: 0.7,
	colorPalette: {
		background: "rgba(255, 255, 255, 0.72)",
		text: "#0f172a",
		textMuted: "#475569",
		border: "rgba(15, 23, 42, 0.10)",
		accent: "rgba(37, 99, 235, 0.9)",
		accentSolid: "#2563eb",
	},
	surface: {
		base: "rgba(255, 255, 255, 0.72)",
		raised: "rgba(255, 255, 255, 0.88)",
		sunken: "rgba(15, 23, 42, 0.04)",
	},
	elevation:
		"0 10px 30px -12px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.06)",
	isDarkMode: false,
};

const darkTheme: GlassMorphismTheme = {
	blurIntensity: "lg",
	baseOpacity: 0.55,
	colorPalette: {
		background: "rgba(30, 41, 59, 0.55)",
		text: "#f1f5f9",
		textMuted: "#94a3b8",
		border: "rgba(148, 163, 184, 0.18)",
		accent: "rgba(96, 165, 250, 0.95)",
		accentSolid: "#3b82f6",
	},
	surface: {
		base: "rgba(30, 41, 59, 0.55)",
		raised: "rgba(51, 65, 85, 0.5)",
		sunken: "rgba(15, 23, 42, 0.55)",
	},
	elevation:
		"0 12px 32px -12px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.35)",
	isDarkMode: true,
};

// Create the context
interface GlassMorphismContextProps {
	theme: GlassMorphismTheme;
	toggleTheme: () => void;
	updateTheme: (updates: Partial<GlassMorphismTheme>) => void;
}

const GlassMorphismContext = createContext<
	GlassMorphismContextProps | undefined
>(undefined);

// Provider component
export function GlassMorphismProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<GlassMorphismTheme>(lightTheme);

	// Resolve the dark/light preference on first load and rebuild from the
	// canonical theme objects. We only read `isDarkMode` from storage so an
	// older/partial saved shape can never produce a malformed theme.
	useEffect(() => {
		let prefersDark = false;
		try {
			const saved = localStorage.getItem("glassmorphismTheme");
			if (saved) {
				prefersDark = !!JSON.parse(saved).isDarkMode;
			} else if (
				window.matchMedia &&
				window.matchMedia("(prefers-color-scheme: dark)").matches
			) {
				prefersDark = true;
			}
		} catch {
			prefersDark = false;
		}

		setTheme(prefersDark ? darkTheme : lightTheme);
		document.documentElement.classList.toggle("dark", prefersDark);
	}, []);

	// Persist theme changes and keep the document class in sync.
	useEffect(() => {
		localStorage.setItem("glassmorphismTheme", JSON.stringify(theme));
		document.documentElement.classList.toggle("dark", theme.isDarkMode);
	}, [theme]);

	// Toggle between light and dark theme
	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme.isDarkMode ? lightTheme : darkTheme));
	};

	// Update specific theme properties
	const updateTheme = (updates: Partial<GlassMorphismTheme>) => {
		setTheme((prevTheme) => ({
			...prevTheme,
			...updates,
		}));
	};

	return (
		<GlassMorphismContext.Provider value={{ theme, toggleTheme, updateTheme }}>
			{children}
		</GlassMorphismContext.Provider>
	);
}

// Custom hook to use the context
export function useGlassMorphism() {
	const context = useContext(GlassMorphismContext);

	if (context === undefined) {
		throw new Error(
			"useGlassMorphism must be used within a GlassMorphismProvider",
		);
	}

	return context;
}
