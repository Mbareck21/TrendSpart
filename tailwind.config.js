/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				glass: {
					DEFAULT: "rgba(var(--glass-bg-color), var(--glass-bg-opacity))",
					border:
						"rgba(var(--glass-border-color), var(--glass-border-opacity))",
					accent: "rgb(var(--glass-accent-color))",
				},
			},
			backdropBlur: {
				sm: "var(--glass-blur-sm)",
				md: "var(--glass-blur-md)",
				lg: "var(--glass-blur-lg)",
				xl: "var(--glass-blur-xl)",
				"2xl": "var(--glass-blur-2xl)",
			},
			transitionDuration: {
				fast: "var(--transition-fast)",
				medium: "var(--transition-medium)",
				slow: "var(--transition-slow)",
			},
			ringColor: {
				DEFAULT: "#3b82f6", // blue-500
				blue: {
					500: "#3b82f6",
				},
			},
			ringWidth: {
				DEFAULT: "1px",
				0: "0px",
				1: "1px",
				2: "2px",
				4: "4px",
				8: "8px",
			},
			ringOffsetWidth: {
				0: "0px",
				1: "1px",
				2: "2px",
				4: "4px",
				8: "8px",
			},
		},
	},
	plugins: [
		// Adding a custom plugin to handle form styles instead of @tailwindcss/forms
		function ({ addUtilities, theme }) {
			const ringUtilities = {
				".focus\\:ring-2:focus": {
					"--tw-ring-offset-shadow":
						"var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)",
					"--tw-ring-shadow":
						"var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)",
					"box-shadow":
						"var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)",
					"--tw-ring-color": theme("ringColor.DEFAULT"),
					"--tw-ring-offset-width": "0px",
				},
				".focus\\:ring-blue-500:focus": {
					"--tw-ring-color": theme("ringColor.blue.500"),
				},
				".focus\\:border-transparent:focus": {
					"border-color": "transparent",
				},
				".form-input-focus": {
					outline: "none",
				},
				".form-select-focus": {
					outline: "none",
				},
			};

			addUtilities(ringUtilities);
		},
	],
};
