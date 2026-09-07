/**
 * The languages the docs are written in — the plain list, with no highlighter attached.
 *
 * This lives apart from `highlighter.ts` on purpose. That module builds a Shiki core with a
 * WebAssembly engine in a top-level `await`, so importing it runs all of that; the build renders
 * these same components under Bun to prerender the site, where none of it is wanted and some of
 * it does not work. A component that only needs to name a language imports this instead.
 */

/**
 * Languages the highlighter knows about. Anything outside this list renders as plain text — by
 * design. Add one here and in `highlighter.ts` together.
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
 * Default language used when a fence has no language hint. Most of our docs are TypeScript-first,
 * so this is a reasonable fallback.
 */
export const DEFAULT_LANGUAGE = "typescript";

export function normalizeLanguage(language: string | undefined | null): string {
    if (!language) return DEFAULT_LANGUAGE;
    const lower = language.toLowerCase();
    if (SUPPORTED_LANGUAGES.has(lower)) return lower;
    return "text";
}
