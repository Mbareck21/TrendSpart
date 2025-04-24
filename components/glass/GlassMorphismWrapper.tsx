"use client";

import React from "react";
import { GlassMorphismProvider } from "./GlassMorphismContext";

export function GlassMorphismProviderWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	return <GlassMorphismProvider>{children}</GlassMorphismProvider>;
}
