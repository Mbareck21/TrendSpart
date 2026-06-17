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
						ariaLabel={
							theme.isDarkMode
								? "Switch to light mode"
								: "Switch to dark mode"
						}
						icon={
							theme.isDarkMode ? (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									aria-hidden='true'>
									<circle cx='12' cy='12' r='4' />
									<path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41' />
								</svg>
							) : (
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='16'
									height='16'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									aria-hidden='true'>
									<path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
								</svg>
							)
						}>
						{theme.isDarkMode ? "Light" : "Dark"}
					</GlassButton>
				</div>
			</div>
		</motion.nav>
	);
}
