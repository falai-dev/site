import { docs, examples, type ContentCategory } from "../lib/content";

/**
 * Every address the site has, and what belongs in its `<head>`.
 *
 * Derived from the same content metadata the router and the sidebar read, so a page can never
 * exist in one and not the other: the build writes a file for exactly the routes the app knows
 * how to render, which is what lets `firebase.json` answer everything else with a real 404.
 */

/** Marks which route a prerendered file carries, so `main.tsx` knows whether it may hydrate. */
export const PRERENDERED_ROUTE_ATTR = "data-prerendered-route";

/** The `<script>` holding the content file this page was rendered with. */
export const PRELOADED_FILE_ID = "falai-preloaded-file";

/** The route the 404 file carries: one no address matches, so landing on it mounts fresh. */
export const SHELL_ROUTE = "*";

export const SITE_URL = "https://falai.dev";

export interface PublicPage {
    /** The route, and the file it is written to. */
    path: string;
    title: string;
    /** The one file under `/content` this page renders, when it renders one. */
    contentPath?: string;
    /**
     * The page's own description. Documents leave this unset and the build takes their first
     * paragraph instead — written by whoever wrote the doc, which beats anything invented here.
     */
    description?: string;
    /** Set when a second route renders the same document, and this one should not own it. */
    canonicalPath?: string;
    priority: number;
    changeFrequency: "weekly" | "monthly";
}

const SUFFIX = " · @falai/agent";

function pagesFor(
    categories: ContentCategory[],
    basePath: "/docs" | "/examples",
    priority: number
): PublicPage[] {
    return categories.flatMap((category) =>
        category.items
            .filter((item) => !item.hidden)
            .map((item) => ({
                path: `${basePath}/${category.slug}/${item.slug}`,
                title: item.title + SUFFIX,
                contentPath: item.path,
                description: item.description,
                priority,
                changeFrequency: "monthly" as const,
            }))
    );
}

const DOCS_README = "/content/docs/README.md";

const PAGES: PublicPage[] = [
    {
        path: "/",
        title: "@falai/agent — type-safe AI agents in TypeScript",
        description:
            "A TypeScript framework for AI agents that follow a script. Define the data you need, the model fills it in, and your code decides what happens next.",
        priority: 1,
        changeFrequency: "weekly",
    },
    {
        path: "/docs",
        title: "Documentation" + SUFFIX,
        contentPath: DOCS_README,
        priority: 0.9,
        changeFrequency: "weekly",
    },
    {
        path: "/examples",
        title: "Examples" + SUFFIX,
        description: "Runnable code that shows the framework in action — one file per idea.",
        priority: 0.8,
        changeFrequency: "weekly",
    },
    ...pagesFor(docs, "/docs", 0.7),
    ...pagesFor(examples, "/examples", 0.6),
];

export const PUBLIC_PAGES: PublicPage[] = PAGES.map((page) =>
    // `/docs` and `/docs/overview/readme` render the same file. Two addresses for one document
    // is a duplicate as far as a search engine is concerned, and it picks the winner unless we
    // do. `/docs` is the one linked from the header, so it wins.
    page.path !== "/docs" && page.contentPath === DOCS_README
        ? { ...page, canonicalPath: "/docs" }
        : page
);
