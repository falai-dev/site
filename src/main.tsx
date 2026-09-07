import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { PreloadedFileContext, type PreloadedFile } from "./lib/content-file.ts";
import { PRELOADED_FILE_ID, PRERENDERED_ROUTE_ATTR } from "./config/publicPages.ts";

const root = document.getElementById("root")!;

/**
 * The content file the build rendered this page with, parked in a `<script>` tag beside the
 * markup it produced. Reading it before the first render is what lets that render match the
 * markup, so the browser hydrates the page instead of replacing it.
 */
function readPreloadedFile(): PreloadedFile | null {
    const tag = document.getElementById(PRELOADED_FILE_ID);
    if (!tag?.textContent) return null;

    try {
        const parsed: unknown = JSON.parse(tag.textContent);
        if (
            typeof parsed === "object" &&
            parsed !== null &&
            "path" in parsed &&
            typeof parsed.path === "string" &&
            "text" in parsed &&
            typeof parsed.text === "string"
        ) {
            return { path: parsed.path, text: parsed.text };
        }
    } catch {
        /* A truncated or mangled payload is not worth a blank page — fetch it instead. */
    }

    return null;
}

const tree = (
    <StrictMode>
        <PreloadedFileContext.Provider value={readPreloadedFile()}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </PreloadedFileContext.Provider>
    </StrictMode>
);

/** `/docs/flow/` and `/docs/flow` are one page. Which one the host serves is the host's business. */
function samePage(a: string | null, b: string): boolean {
    const trim = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);
    return a !== null && trim(a) === trim(b);
}

// Hydrate only the file the build rendered for THIS address. The 404 file is served for every
// address that has none, and it carries no route of its own, so it lands here and mounts fresh —
// hydrating markup that describes a different page is the one thing React cannot recover from.
if (samePage(root.getAttribute(PRERENDERED_ROUTE_ATTR), window.location.pathname)) {
    hydrateRoot(root, tree);
} else {
    createRoot(root).render(tree);
}
