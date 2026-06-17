"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGlassMorphism, GlassComponentProps } from "./GlassMorphismContext";

export interface GlassButtonProps extends GlassComponentProps {
	children: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	variant?: "primary" | "secondary" | "outlined";
	size?: "sm" | "md" | "lg";
	fullWidth?: boolean;
	icon?: React.ReactNode;
	type?: "button" | "submit" | "reset";
	as?: "button" | "a" | "div" | "span";
	href?: string;
	target?: string;
	rel?: string;
	ariaLabel?: string;
}

export function GlassButton({
	children,
	customBlur,
	customBorder,
	animation = true,
	className = "",
	onClick,
	disabled = false,
	variant = "primary",
	size = "md",
	fullWidth = false,
	icon,
	type = "button",
	as = "button",
	href,
	target,
	rel,
	ariaLabel,
}: GlassButtonProps) {
	const { theme } = useGlassMorphism();

	// Determine the blur value to use
	const blurValue = customBlur || "sm"; // Lower blur for buttons
	const blurMap = {
		sm: "4px",
		md: "8px",
		lg: "12px",
		xl: "16px",
		"2xl": "24px",
	};

	// Size classes
	const sizeClasses = {
		sm: "text-xs py-1.5 px-3",
		md: "text-sm py-2 px-4",
		lg: "text-base py-3 px-6",
	};

	// Variants
	const getVariantStyles = () => {
		switch (variant) {
			case "primary":
				return {
					backgroundColor: theme.colorPalette.accentSolid,
					border: `1px solid ${theme.colorPalette.accentSolid}`,
					color: "#ffffff",
					boxShadow: `0 6px 18px -6px ${
						theme.isDarkMode
							? "rgba(59, 130, 246, 0.55)"
							: "rgba(37, 99, 235, 0.45)"
					}`,
				};
			case "secondary":
				return {
					backgroundColor: theme.surface.sunken,
					border: `1px solid ${theme.colorPalette.border}`,
					color: theme.colorPalette.text,
				};
			case "outlined":
				return {
					backgroundColor: "transparent",
					border: `1px solid ${theme.colorPalette.border}`,
					color: theme.colorPalette.text,
				};
			default:
				return {};
		}
	};

	// Disabled styles
	const disabledStyles = disabled
		? {
				opacity: 0.5,
				cursor: "not-allowed",
				pointerEvents: "none" as const,
		  }
		: {};
	// Common props for all element types
	const commonProps = {
		"aria-label": ariaLabel,
		className: `glass-focus-ring cursor-pointer rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
			sizeClasses[size]
		} ${fullWidth ? "w-full" : ""} ${className}`,
		style: {
			backdropFilter: `blur(${blurMap[blurValue]})`,
			WebkitBackdropFilter: `blur(${blurMap[blurValue]})`,
			...getVariantStyles(),
			...(customBorder ? { border: `1px solid ${customBorder}` } : {}),
			...disabledStyles,
		},
		initial: animation ? { opacity: 0 } : false,
		animate: animation ? { opacity: 1 } : false,
		transition: { duration: 0.2 },
		whileHover: !disabled ? { scale: 1.03 } : {},
		whileTap: !disabled ? { scale: 0.97 } : {},
		onClick: disabled ? undefined : onClick,
	};

	// Render as anchor when 'as' is set to 'a' and href is provided
	if (as === "a" && href) {
		return (
			<motion.a href={href} target={target} rel={rel} {...commonProps}>
				{icon && <span className='button-icon'>{icon}</span>}
				{children}
			</motion.a>
		);
	}

	// Default render as button
	return (
		<motion.button type={type} disabled={disabled} {...commonProps}>
			{icon && <span className='button-icon'>{icon}</span>}
			{children}
		</motion.button>
	);
}
