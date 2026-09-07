import { createHighlighterCore, createOnigurumaEngine } from "react-shiki/core";

/**
 * Custom Shiki highlighter scoped to the languages we actually use across the
 * @falai/agent docs and examples. Keeps the bundle tiny by importing only what
 * we need (versus react-shiki's default ~1.2MB or web bundle).
 *
 * Add a language here when a doc starts using it, and to `SUPPORTED_LANGUAGES` in `languages.ts`.
 *
 * The top-level `await` and the WebAssembly engine are why nothing imports this module
 * statically: `CodeBlock` reaches for it with a dynamic `import()` after it mounts, so the
 * build's Bun render never evaluates it and no page pays for the engine until it has code to
 * highlight.
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
