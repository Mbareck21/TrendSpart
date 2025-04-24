"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGlassMorphism, GlassComponentProps } from "./GlassMorphismContext";

// Base input props
interface BaseInputProps extends GlassComponentProps {
	id?: string;
	name?: string;
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	error?: string;
}

// Text input props
export interface GlassInputProps extends BaseInputProps {
	type?: "text" | "email" | "password" | "number" | "tel" | "url";
	value: string | number;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	min?: number;
	max?: number;
}

// Select input props
export interface GlassSelectProps extends BaseInputProps {
	options: Array<{ value: string; label: string }>;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

// Text Area props
export interface GlassTextAreaProps extends BaseInputProps {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	rows?: number;
}

// Input component
export function GlassInput({
	id,
	name,
	label,
	placeholder,
	type = "text",
	value,
	onChange,
	disabled = false,
	required = false,
	error,
	customBlur,
	customOpacity,
	customBorder,
	className = "",
	animation = true,
	min,
	max,
}: GlassInputProps) {
	const { theme } = useGlassMorphism();

	// Determine the blur value
	const blurValue = customBlur || "sm"; // Lower blur for inputs
	const blurMap = {
		sm: "4px",
		md: "8px",
		lg: "12px",
		xl: "16px",
		"2xl": "24px",
	};

	// Determine the opacity value
	const opacityValue =
		customOpacity !== undefined ? customOpacity : theme.isDarkMode ? 0.1 : 0.1;

	// Determine border color
	const borderColor = error
		? "rgba(239, 68, 68, 0.5)"
		: customBorder || theme.colorPalette.border;

	// Input styles
	const inputStyles = {
		backgroundColor: theme.isDarkMode
			? `rgba(30, 41, 59, ${opacityValue})`
			: `rgba(255, 255, 255, ${opacityValue})`,
		backdropFilter: `blur(${blurMap[blurValue]})`,
		WebkitBackdropFilter: `blur(${blurMap[blurValue]})`,
		border: `1px solid ${borderColor}`,
		color: theme.isDarkMode ? "#ffffff" : "#333333",
	};

	return (
		<div className={`mb-4 ${className}`}>
			{label && (
				<label
					htmlFor={id || name}
					className={`block text-sm font-medium mb-1 ${
						theme.isDarkMode ? "text-gray-200" : "text-gray-700"
					}`}>
					{label}
					{required && <span className='text-red-500 ml-1'>*</span>}
				</label>
			)}

			<motion.input
				id={id || name}
				name={name}
				type={type}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				disabled={disabled}
				required={required}
				min={min}
				max={max}
				className='w-full rounded-md py-2 px-3 outline-none focus:ring-2 transition-all'
				style={inputStyles}
				initial={animation ? { opacity: 0, y: 10 } : undefined}
				animate={animation ? { opacity: 1, y: 0 } : undefined}
				transition={{ duration: 0.2 }}
			/>

			{error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
		</div>
	);
}

// Select component
export function GlassSelect({
	id,
	name,
	label,
	placeholder,
	options,
	value,
	onChange,
	disabled = false,
	required = false,
	error,
	customBlur,
	customOpacity,
	customBorder,
	className = "",
	animation = true,
}: GlassSelectProps) {
	const { theme } = useGlassMorphism();

	// Determine the blur value
	const blurValue = customBlur || "sm";
	const blurMap = {
		sm: "4px",
		md: "8px",
		lg: "12px",
		xl: "16px",
		"2xl": "24px",
	};

	// Determine the opacity value
	const opacityValue =
		customOpacity !== undefined ? customOpacity : theme.isDarkMode ? 0.1 : 0.1;

	// Determine border color
	const borderColor = error
		? "rgba(239, 68, 68, 0.5)"
		: customBorder || theme.colorPalette.border;
	// Select styles
	const selectStyles = {
		backgroundColor: theme.isDarkMode
			? `rgba(30, 41, 59, ${opacityValue + 0.15})`
			: `rgba(255, 255, 255, ${opacityValue + 0.15})`,
		backdropFilter: `blur(${blurMap[blurValue]})`,
		WebkitBackdropFilter: `blur(${blurMap[blurValue]})`,
		border: `1px solid ${borderColor}`,
		color: theme.isDarkMode ? "#ffffff" : "#333333",
		backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${
			theme.isDarkMode ? "white" : "black"
		}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
		backgroundPosition: "right 0.5rem center",
		backgroundRepeat: "no-repeat",
		backgroundSize: "1.5em 1.5em",
		paddingRight: "2.5rem",
		appearance: "none",
	};

	return (
		<div className={`mb-4 ${className}`}>
			{label && (
				<label
					htmlFor={id || name}
					className={`block text-sm font-medium mb-1 ${
						theme.isDarkMode ? "text-gray-200" : "text-gray-700"
					}`}>
					{label}
					{required && <span className='text-red-500 ml-1'>*</span>}
				</label>
			)}

			<motion.select
				id={id || name}
				name={name}
				value={value}
				onChange={onChange}
				disabled={disabled}
				required={required}
				className='w-full rounded-md py-2 px-3 outline-none focus:ring-2 transition-all'
				style={selectStyles}
				initial={animation ? { opacity: 0, y: 10 } : undefined}
				animate={animation ? { opacity: 1, y: 0 } : undefined}
				transition={{ duration: 0.2 }}>
				{placeholder && (
					<option value='' disabled>
						{placeholder}
					</option>
				)}

				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</motion.select>

			{error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
		</div>
	);
}

// TextArea component
export function GlassTextArea({
	id,
	name,
	label,
	placeholder,
	value,
	onChange,
	disabled = false,
	required = false,
	error,
	customBlur,
	customOpacity,
	customBorder,
	className = "",
	animation = true,
	rows = 4,
}: GlassTextAreaProps) {
	const { theme } = useGlassMorphism();

	// Determine the blur value
	const blurValue = customBlur || "sm";
	const blurMap = {
		sm: "4px",
		md: "8px",
		lg: "12px",
		xl: "16px",
		"2xl": "24px",
	};

	// Determine the opacity value
	const opacityValue =
		customOpacity !== undefined ? customOpacity : theme.isDarkMode ? 0.1 : 0.1;

	// Determine border color
	const borderColor = error
		? "rgba(239, 68, 68, 0.5)"
		: customBorder || theme.colorPalette.border;

	// TextArea styles
	const textAreaStyles = {
		backgroundColor: theme.isDarkMode
			? `rgba(30, 41, 59, ${opacityValue})`
			: `rgba(255, 255, 255, ${opacityValue})`,
		backdropFilter: `blur(${blurMap[blurValue]})`,
		WebkitBackdropFilter: `blur(${blurMap[blurValue]})`,
		border: `1px solid ${borderColor}`,
		color: theme.isDarkMode ? "#ffffff" : "#333333",
	};

	return (
		<div className={`mb-4 ${className}`}>
			{label && (
				<label
					htmlFor={id || name}
					className={`block text-sm font-medium mb-1 ${
						theme.isDarkMode ? "text-gray-200" : "text-gray-700"
					}`}>
					{label}
					{required && <span className='text-red-500 ml-1'>*</span>}
				</label>
			)}

			<motion.textarea
				id={id || name}
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				disabled={disabled}
				required={required}
				rows={rows}
				className='w-full rounded-md py-2 px-3 outline-none focus:ring-2 transition-all'
				style={textAreaStyles}
				initial={animation ? { opacity: 0, y: 10 } : undefined}
				animate={animation ? { opacity: 1, y: 0 } : undefined}
				transition={{ duration: 0.2 }}
			/>

			{error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
		</div>
	);
}
