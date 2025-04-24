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
		border: string;
		accent: string;
	};
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
	blurIntensity: "md",
	baseOpacity: 0.2,
	colorPalette: {
		background: "rgba(255, 255, 255, 0.2)",
		text: "#333333",
		border: "rgba(255, 255, 255, 0.3)",
		accent: "rgba(59, 130, 246, 0.7)",
	},
	isDarkMode: false,
};

const darkTheme: GlassMorphismTheme = {
	blurIntensity: "md",
	baseOpacity: 0.15,
	colorPalette: {
		background: "rgba(15, 23, 42, 0.3)",
		text: "#ffffff",
		border: "rgba(255, 255, 255, 0.1)",
		accent: "rgba(59, 130, 246, 0.6)",
	},
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

	// Check if dark mode is enabled in system or localStorage on initial load
	useEffect(() => {
		const savedTheme = localStorage.getItem("glassmorphismTheme");

		if (savedTheme) {
			setTheme(JSON.parse(savedTheme));
		} else if (
			window.matchMedia &&
			window.matchMedia("(prefers-color-scheme: dark)").matches
		) {
			setTheme(darkTheme);
		}

		// Apply theme to document for global CSS variables
		document.documentElement.classList.toggle("dark", theme.isDarkMode);
	}, []);

	// Save theme changes to localStorage
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
