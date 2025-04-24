"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlassMorphism, GlassComponentProps } from "./GlassMorphismContext";
import { GlassButton } from "./GlassButton";

export interface GlassModalProps extends GlassComponentProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
	closeOnOutsideClick?: boolean;
	closeOnEscape?: boolean;
	showCloseButton?: boolean;
}

export function GlassModal({
	isOpen,
	onClose,
	title,
	children,
	footer,
	customBlur,
	customOpacity,
	customBorder,
	animation = true,
	className = "",
	maxWidth = "md",
	closeOnOutsideClick = true,
	closeOnEscape = true,
	showCloseButton = true,
}: GlassModalProps) {
	const { theme } = useGlassMorphism();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);

		// Add ESC key event listener
		if (closeOnEscape) {
			const handleEsc = (e: KeyboardEvent) => {
				if (e.key === "Escape") onClose();
			};

			window.addEventListener("keydown", handleEsc);
			return () => window.removeEventListener("keydown", handleEsc);
		}
	}, [closeOnEscape, onClose]);

	// Handle outside clicks
	const handleOutsideClick = () => {
		if (closeOnOutsideClick) {
			onClose();
		}
	};

	// Prevent modal content clicks from closing
	const handleContentClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	// Determine the blur value
	const blurValue = customBlur || "xl"; // Higher blur for modals
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

	// Determine border color
	const borderColor = customBorder || theme.colorPalette.border;

	// Define max width classes
	const maxWidthClasses = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
		full: "max-w-full",
	};

	// Modal styles
	const modalStyles = {
		backgroundColor: theme.isDarkMode
			? `rgba(15, 23, 42, ${opacityValue})`
			: `rgba(255, 255, 255, ${opacityValue})`,
		backdropFilter: `blur(${blurMap[blurValue]})`,
		WebkitBackdropFilter: `blur(${blurMap[blurValue]})`,
		border: `1px solid ${borderColor}`,
		boxShadow: theme.isDarkMode
			? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
			: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
	};

	// Animation variants
	const overlayVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
	};

	const modalVariants = {
		hidden: { opacity: 0, y: -20, scale: 0.95 },
		visible: { opacity: 1, y: 0, scale: 1 },
	};

	if (!isMounted) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40'
					onClick={handleOutsideClick}
					variants={overlayVariants}
					initial='hidden'
					animate='visible'
					exit='hidden'
					transition={{ duration: 0.2 }}>
					<motion.div
						className={`w-full ${maxWidthClasses[maxWidth]} rounded-xl overflow-hidden ${className}`}
						style={modalStyles}
						onClick={handleContentClick}
						variants={modalVariants}
						initial='hidden'
						animate='visible'
						exit='hidden'
						transition={{ duration: 0.3, type: "spring", damping: 25 }}>
						{title && (
							<div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center'>
								<h3
									className={`font-semibold ${
										theme.isDarkMode ? "text-white" : "text-gray-800"
									}`}>
									{title}
								</h3>

								{showCloseButton && (
									<button
										onClick={onClose}
										className={`p-1 rounded-full hover:bg-black/10 hover:dark:bg-white/10 transition-colors ${
											theme.isDarkMode ? "text-gray-300" : "text-gray-600"
										}`}
										aria-label='Close modal'>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width='20'
											height='20'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'>
											<line x1='18' y1='6' x2='6' y2='18'></line>
											<line x1='6' y1='6' x2='18' y2='18'></line>
										</svg>
									</button>
								)}
							</div>
						)}

						<div className='px-6 py-4'>{children}</div>

						{footer && (
							<div className='px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2'>
								{footer}
							</div>
						)}

						{!footer && showCloseButton && !title && (
							<div className='px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end'>
								<GlassButton variant='secondary' onClick={onClose}>
									Close
								</GlassButton>
							</div>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
