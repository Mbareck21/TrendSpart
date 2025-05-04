import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		// Disable ESLint during the build process
		ignoreDuringBuilds: true,
	},
	typescript: {
		// Disable TypeScript error checking during builds
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
