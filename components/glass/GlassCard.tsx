"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGlassMorphism, GlassComponentProps } from "./GlassMorphismContext";

export interface GlassCardProps extends GlassComponentProps {
	children: React.ReactNode;
	onClick?: () => void;
	isSelected?: boolean;
	hoverEffect?: boolean;
}

export function GlassCard({
	children,
	customBlur,
	customOpacity,
	customBorder,
	animation = true,
	className = "",
	onClick,
	isSelected = false,
	hoverEffect = true,
}: GlassCardProps) {
	const { theme } = useGlassMorphism();

	// Determine the blur value to use
	const blurValue = customBlur || theme.blurIntensity;
	const blurMap = {
		sm: "4px",
		md: "8px",
		lg: "12px",
		xl: "16px",
		"2xl": "24px",
	};

	// Determine the opacity value
	const opacityValue =
		customOpacity !== undefined ? customOpacity : theme.baseOpacity;

	// Determine border color
	const borderColor = customBorder || theme.colorPalette.border;

	const baseStyles = {
		backgroundColor: theme.isDarkMode
			? `rgba(15, 23, 42, ${opacityValue})`
			: `rgba(255, 255, 255, ${opacityValue})`,
		backdropFilter: `blur(${blurMap[blurValue]})`,
		WebkitBackdropFilter: `blur(${blurMap[blurValue]})`,
		border: `1px solid ${borderColor}`,
		boxShadow: theme.isDarkMode
			? "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
			: "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
	};

	// Apply additional styles for selected state
	const selectedStyles = isSelected
		? {
				boxShadow: `0 0 0 2px ${theme.colorPalette.accent}, ${baseStyles.boxShadow}`,
		  }
		: {};

	return (
		<motion.div
			className={`rounded-xl p-4 overflow-hidden transition-all ${className}`}
			style={{
				...baseStyles,
				...selectedStyles,
			}}
			initial={animation ? { opacity: 0, y: 20 } : false}
			animate={animation ? { opacity: 1, y: 0 } : false}
			transition={{ duration: 0.3 }}
			whileHover={
				hoverEffect
					? {
							scale: 1.02,
							boxShadow: theme.isDarkMode
								? "0 10px 15px rgba(0, 0, 0, 0.2), 0 4px 6px rgba(0, 0, 0, 0.15)"
								: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
					  }
					: {}
			}
			onClick={onClick}
			whileTap={onClick ? { scale: 0.98 } : undefined}>
			{children}
		</motion.div>
	);
}
