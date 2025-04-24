"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useGlassMorphism, GlassComponentProps } from "./GlassMorphismContext";
import { GlassButton } from "./GlassButton";

export interface GlassNavigationProps extends GlassComponentProps {
	title?: string;
	logo?: React.ReactNode;
	rightContent?: React.ReactNode;
	sticky?: boolean;
}

export function GlassNavigation({
	title = "TrendSpark",
	logo,
	rightContent,
	customBlur,
	customOpacity,
	customBorder,
	animation = true,
	className = "",
	sticky = true,
}: GlassNavigationProps) {
	const { theme, toggleTheme } = useGlassMorphism();
	const [isScrolled, setIsScrolled] = useState(false);

	// Update scroll state
	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 20);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Determine the blur value to use
	const blurValue = customBlur || theme.blurIntensity;
	const blurMap = {
		sm: "4px",
		md: "8px",
		lg: "12px",
		xl: "16px",
		"2xl": "24px",
	};

	// Determine the opacity value - increase slightly when scrolled
	const baseOpacity =
		customOpacity !== undefined ? customOpacity : theme.baseOpacity;
	const opacityValue = isScrolled ? baseOpacity + 0.1 : baseOpacity;

	// Determine border color
	const borderColor = customBorder || theme.colorPalette.border;

	// Navigation styles
	const navStyles = {
		backgroundColor: theme.isDarkMode
			? `rgba(15, 23, 42, ${opacityValue})`
			: `rgba(255, 255, 255, ${opacityValue})`,
		backdropFilter: `blur(${blurMap[blurValue]})`,
		WebkitBackdropFilter: `blur(${blurMap[blurValue]})`,
		borderBottom: `1px solid ${borderColor}`,
		boxShadow: isScrolled
			? theme.isDarkMode
				? "0 4px 6px rgba(0, 0, 0, 0.1)"
				: "0 4px 6px rgba(0, 0, 0, 0.05)"
			: "none",
		color: theme.isDarkMode ? "#ffffff" : "#333333",
	};

	return (
		<motion.nav
			className={`py-3 px-4 sm:px-6 ${
				sticky ? "sticky top-0 z-50" : ""
			} ${className}`}
			style={navStyles}
			initial={animation ? { y: -20, opacity: 0 } : false}
			animate={animation ? { y: 0, opacity: 1 } : false}
			transition={{ duration: 0.3 }}>
			<div className='flex items-center justify-between max-w-7xl mx-auto'>
				<div className='flex items-center gap-3'>
					{logo && <div className='logo-container'>{logo}</div>}
					{title && (
						<h1 className='text-lg sm:text-xl font-bold tracking-tight'>
							{title}
						</h1>
					)}
				</div>

				<div className='flex items-center gap-3'>
					{rightContent}

					<GlassButton
						variant='secondary'
						size='sm'
						onClick={toggleTheme}
						icon={
							theme.isDarkMode ? (
								<span role='img' aria-label='Light mode'>
									☀️
								</span>
							) : (
								<span role='img' aria-label='Dark mode'>
									🌙
								</span>
							)
						}>
						{theme.isDarkMode ? "Light" : "Dark"}
					</GlassButton>
				</div>
			</div>
		</motion.nav>
	);
}
