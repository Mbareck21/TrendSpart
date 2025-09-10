"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGlassMorphism, GlassComponentProps } from "./GlassMorphismContext";

export interface GlassSpinnerProps extends GlassComponentProps {
	size?: "sm" | "md" | "lg";
	label?: string;
	center?: boolean;
}

export function GlassSpinner({
	customBlur,
	customOpacity,
	animation = true,
	className = "",
	size = "md",
	label,
	center = false,
}: GlassSpinnerProps) {
	const { theme } = useGlassMorphism();

	// Determine the blur value
	const blurValue = customBlur || "lg";
	const blurMap = {
		sm: "4px",
		md: "8px",
		lg: "12px",
		xl: "16px",
		"2xl": "24px",
	};

	// Determine the opacity value
	const opacityValue =
		customOpacity !== undefined ? customOpacity : theme.isDarkMode ? 0.2 : 0.15;

	// Size dimensions
	const sizeDimensions = {
		sm: { outer: "h-12 w-12", inner: "h-8 w-8" },
		md: { outer: "h-16 w-16", inner: "h-10 w-10" },
		lg: { outer: "h-24 w-24", inner: "h-16 w-16" },
	};

	// Spinner styles
	const spinnerStyles = {
		backgroundColor: theme.isDarkMode
			? `rgba(15, 23, 42, ${opacityValue})`
			: `rgba(255, 255, 255, ${opacityValue})`,
		backdropFilter: `blur(${blurMap[blurValue]})`,
		WebkitBackdropFilter: `blur(${blurMap[blurValue]})`,
		border: `1px solid ${theme.colorPalette.border}`,
	};

	// Animation variants
	const containerVariants = {
		initial: { opacity: 0, scale: 0.8 },
		animate: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.3 },
		},
	};

	const spinnerVariants = {
		animate: {
			rotate: 360,
			transition: {
				repeat: Infinity,
				duration: 1.5,
				ease: "linear",
			},
		},
	};

	return (
		<motion.div
			className={`${
				center ? "flex flex-col items-center justify-center" : ""
			} ${className}`}
			variants={containerVariants}
			initial={animation ? "initial" : false}
			animate={animation ? "animate" : false}>
			<motion.div
				className={`rounded-full flex items-center justify-center ${sizeDimensions[size].outer}`}
				style={spinnerStyles}>
				<motion.div
					className={`rounded-full border-2 border-transparent ${sizeDimensions[size].inner}`}
					style={{
						borderTopColor: theme.colorPalette.accent,
						borderLeftColor: theme.colorPalette.accent,
					}}
					variants={spinnerVariants}
					animate='animate'
				/>
			</motion.div>

			{label && (
				<p
					className={`mt-3 text-center ${
						theme.isDarkMode ? "text-gray-300" : "text-gray-700"
					}`}>
					{label}
				</p>
			)}
		</motion.div>
	);
}
