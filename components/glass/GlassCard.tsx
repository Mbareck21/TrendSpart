"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGlassMorphism, GlassComponentProps } from "./GlassMorphismContext";

export interface GlassCardProps extends GlassComponentProps {
	children: React.ReactNode;
	onClick?: () => void;
	isSelected?: boolean;
	hoverEffect?: boolean;
	/** Use the lighter elevated surface so nested cards stand out from their parent. */
	raised?: boolean;
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
	raised = false,
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

	// Background: layered surface by default; honour customOpacity if provided.
	const backgroundColor =
		customOpacity !== undefined
			? theme.isDarkMode
				? `rgba(15, 23, 42, ${customOpacity})`
				: `rgba(255, 255, 255, ${customOpacity})`
			: raised
			? theme.surface.raised
			: theme.surface.base;

	// Determine border color
	const borderColor = customBorder || theme.colorPalette.border;

	// Subtle top highlight reinforces the frosted-glass look on dark surfaces.
	const highlight = theme.isDarkMode
		? "inset 0 1px 0 rgba(255, 255, 255, 0.06)"
		: "inset 0 1px 0 rgba(255, 255, 255, 0.7)";
	const restingShadow = `${highlight}, ${theme.elevation}`;
	const hoverShadow = theme.isDarkMode
		? `${highlight}, 0 18px 40px -14px rgba(0, 0, 0, 0.7), 0 4px 12px rgba(0, 0, 0, 0.4)`
		: `${highlight}, 0 18px 40px -14px rgba(15, 23, 42, 0.22), 0 4px 12px rgba(15, 23, 42, 0.08)`;

	const baseStyles = {
		backgroundColor,
		backdropFilter: `blur(${blurMap[blurValue]})`,
		WebkitBackdropFilter: `blur(${blurMap[blurValue]})`,
		border: `1px solid ${borderColor}`,
		boxShadow: restingShadow,
	};

	// Apply additional styles for selected state
	// Override the full `border` shorthand (not the borderColor longhand) so the
	// style object never mixes shorthand + longhand across selected/deselected
	// renders, which would trigger React's style-diff warning.
	const selectedStyles = isSelected
		? {
				border: `1px solid ${theme.colorPalette.accentSolid}`,
				boxShadow: `0 0 0 2px ${theme.colorPalette.accentSolid}, ${restingShadow}`,
		  }
		: {};

	return (
		<motion.div
			className={`rounded-xl p-4 overflow-hidden transition-colors ${className}`}
			style={{
				...baseStyles,
				...selectedStyles,
			}}
			initial={animation ? { opacity: 0, y: 20 } : false}
			animate={animation ? { opacity: 1, y: 0 } : false}
			transition={{ duration: 0.3 }}
			whileHover={
				hoverEffect && !isSelected
					? {
							scale: 1.01,
							boxShadow: hoverShadow,
					  }
					: {}
			}
			onClick={onClick}
			whileTap={onClick ? { scale: 0.99 } : undefined}>
			{children}
		</motion.div>
	);
}
