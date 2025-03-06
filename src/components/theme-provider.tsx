"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider 
			{...props}
			enableSystem={true}
			attribute="class"
			defaultTheme="system"
			enableColorScheme={false}
			storageKey="aviation-sms-theme"
		>
			{children}
		</NextThemesProvider>
	);
}
