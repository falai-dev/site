import { createHighlighterCore, createOnigurumaEngine } from "react-shiki/core";

/**
 * Custom Shiki highlighter scoped to the languages we actually use across the
 * @falai/agent docs and examples. Keeps the bundle tiny by importing only what
 * we need (versus react-shiki's default ~1.2MB or web bundle).
 *
 * Add a language here when a doc starts using it.
 */
export const highlighter = await createHighlighterCore({
    themes: [
        import("@shikijs/themes/github-dark-default"),
        import("@shikijs/themes/github-light-default"),
    ],
    langs: [
        import("@shikijs/langs/typescript"),
        import("@shikijs/langs/tsx"),
        import("@shikijs/langs/javascript"),
        import("@shikijs/langs/jsx"),
        import("@shikijs/langs/json"),
        import("@shikijs/langs/bash"),
        import("@shikijs/langs/sql"),
        import("@shikijs/langs/prisma"),
        import("@shikijs/langs/markdown"),
        import("@shikijs/langs/mermaid"),
    ],
    engine: createOnigurumaEngine(import("shiki/wasm")),
});

/**
 * Languages this highlighter knows about. Anything outside this list will
 * render as plain text — by design.
 */
export const SUPPORTED_LANGUAGES = new Set([
    "typescript",
    "ts",
    "tsx",
    "javascript",
    "js",
    "jsx",
    "json",
    "bash",
    "sh",
    "shell",
    "sql",
    "prisma",
    "markdown",
    "md",
    "mermaid",
]);

/**
 * Default language used when a fence has no language hint. Most of our docs
 * are TypeScript-first, so this is a reasonable fallback.
 */
export const DEFAULT_LANGUAGE = "typescript";

export function normalizeLanguage(language: string | undefined | null): string {
    if (!language) return DEFAULT_LANGUAGE;
    const lower = language.toLowerCase();
    if (SUPPORTED_LANGUAGES.has(lower)) return lower;
    return "text";
}
