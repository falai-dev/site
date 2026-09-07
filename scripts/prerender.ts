#!/usr/bin/env bun
/**
 * The site, rendered to files — every page, with its documentation in it.
 *
 * falai.dev shipped a correct `<title>` over `<div id="root"></div>` on all forty-odd addresses:
 * a blank white page to a search engine, to a link preview, and to any reader whose JavaScript
 * never arrived. For a documentation site that is the whole product — nobody finds a framework
 * they cannot search for.
 *
 * Runs after `vite build` (the browser bundle, which leaves `dist/index.html` as the template)
 * and `vite build --ssr src/entry-server.tsx` (the same app compiled for Bun).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
    PRELOADED_FILE_ID,
    PRERENDERED_ROUTE_ATTR,
    PUBLIC_PAGES,
    SHELL_ROUTE,
    SITE_URL,
    type PublicPage,
} from "../src/config/publicPages.ts";
import type { PreloadedFile } from "../src/lib/content-file.ts";

const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(APP, "dist");

/** An address that cannot exist, used to render the not-found page into the 404 file. */
const NOWHERE = "/__not-found__";

/** Leading `---` block: metadata for the build, not prose for the reader. */
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

const FALLBACK_DESCRIPTION =
    "Documentation for @falai/agent, a TypeScript framework for AI agents that follow a script.";

interface Renderer {
    renderPage: (routePath: string, preloaded: PreloadedFile | null) => Promise<string>;
}

function isRenderer(mod: unknown): mod is Renderer {
    return typeof mod === "object" && mod !== null && "renderPage" in mod;
}

async function loadRenderer(): Promise<Renderer> {
    const entry = path.join(APP, "dist-ssr", "entry-server.js");
    const mod: unknown = await import(pathToFileURL(entry).href);
    if (!isRenderer(mod) || typeof mod.renderPage !== "function")
        throw new Error(`prerender: ${entry} does not export renderPage — run vite build --ssr`);
    return mod;
}

/**
 * The template, and a refusal to bake one twice.
 *
 * `dist/index.html` is BOTH the template and the landing page's destination, so a second run over
 * a `dist/` this script has already touched would read a finished page as its blank — and every
 * file of that run would carry the landing page nested inside its own. `vite build` empties
 * `dist/` and normally makes this impossible; what does not is a restored build cache, or
 * somebody running this script directly to debug it.
 */
async function loadTemplate(): Promise<string> {
    const file = path.join(DIST, "index.html");
    const template = await readFile(file, "utf8");
    if (template.includes(PRERENDERED_ROUTE_ATTR))
        throw new Error(
            `prerender: ${file} is already a rendered page, not the template — ` +
                "run `vite build` to regenerate it before prerendering again"
        );
    return template;
}

function escapeAttr(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Replace the `content` of a meta tag matched by its name/property attribute. */
function setMeta(html: string, attr: "name" | "property", key: string, value: string): string {
    // Tolerates attribute order and multi-line tags (prettier wraps the long ones).
    const re = new RegExp(`(<meta[^>]*\\s${attr}="${key}"[^>]*\\scontent=")[^"]*(")`, "s");
    const withOrder = html.replace(re, `$1${escapeAttr(value)}$2`);
    if (withOrder !== html) return withOrder;
    const reAlt = new RegExp(`(<meta[^>]*\\scontent=")[^"]*("[^>]*\\s${attr}="${key}")`, "s");
    return html.replace(reAlt, `$1${escapeAttr(value)}$2`);
}

function truncate(text: string, limit: number): string {
    if (text.length <= limit) return text;
    const cut = text.slice(0, limit);
    const lastSpace = cut.lastIndexOf(" ");
    return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]$/, "")}…`;
}

/**
 * A page's description, taken from the document's own opening paragraph.
 *
 * Written by whoever wrote the doc, which beats anything this script could invent — and the
 * metadata the sidebar reads has no description for documentation pages, only for examples.
 */
function describe(markdown: string): string {
    const body = markdown
        .replace(FRONTMATTER, "")
        .replace(/```[\s\S]*?```/g, "")
        .replace(/<!--[\s\S]*?-->/g, "");

    for (const block of body.split(/\n\s*\n/)) {
        const trimmed = block.trim();
        // Headings, quotes, tables, lists and raw HTML are structure, not a summary.
        if (!trimmed || /^(#|>|\||<|[-*+]\s|\d+\.\s)/.test(trimmed)) continue;

        const text = trimmed
            .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
            .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
            .replace(/[`*_]/g, "")
            .replace(/\s+/g, " ")
            .trim();

        if (text.length >= 40) return truncate(text, 155);
    }

    return "";
}

/**
 * The content file, as a `<script>` the browser can read before its first render.
 *
 * `<` is escaped throughout rather than just at `</script`: the payload is documentation, some of
 * which is HTML examples, and one `</script>` inside a code fence would end the tag early and
 * spill a markdown file into the page as markup.
 */
function preloadTag(file: PreloadedFile): string {
    const json = JSON.stringify(file).replace(/</g, "\\u003c");
    return `<script id="${PRELOADED_FILE_ID}" type="application/json">${json}</script>`;
}

interface Baked {
    /** Path of the file to emit, relative to `dist` (`docs/start/01-install/index.html`). */
    file: string;
    html: string;
}

function bake(
    template: string,
    page: PublicPage,
    body: { route: string; html: string },
    preloaded: PreloadedFile | null,
    description: string
): Baked {
    const url = `${SITE_URL}${page.path}`;
    const canonical = `${SITE_URL}${page.canonicalPath ?? page.path}`;

    let html = template.replace(
        /<title>[^<]*<\/title>/,
        `<title>${escapeAttr(page.title)}</title>`
    );
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escapeAttr(canonical)}$2`);
    html = setMeta(html, "name", "description", description);
    html = setMeta(html, "property", "og:url", url);
    html = setMeta(html, "property", "og:title", page.title);
    html = setMeta(html, "property", "og:description", description);
    html = setMeta(html, "property", "twitter:url", url);
    html = setMeta(html, "property", "twitter:title", page.title);
    html = setMeta(html, "property", "twitter:description", description);

    // Empty on purpose in the template, and it must STAY empty there: a second bake over an
    // already-filled root would nest one render inside another.
    const rootEl = '<div id="root"></div>';
    if (!html.includes(rootEl)) throw new Error(`prerender: ${rootEl} not found in index.html`);
    html = html.replace(
        rootEl,
        `<div id="root" ${PRERENDERED_ROUTE_ATTR}="${escapeAttr(body.route)}">${body.html}</div>` +
            (preloaded ? `\n    ${preloadTag(preloaded)}` : "")
    );

    const file = page.path === "/" ? "index.html" : `${page.path.replace(/^\//, "")}/index.html`;
    return { file, html };
}

/**
 * What every written file must be true of before the build is allowed to pass.
 *
 * The regression this exists for is a route that renders to nothing. A router whose location does
 * not match its routes yields empty markup with no error and no warning — it looks fine in every
 * browser and is invisible to everything that reads a link. Checking the bytes we actually wrote
 * is the only thing that catches it, and it needs no browser, so it gates the BUILD.
 */
function assertRendered(file: string, html: string, template: string): void {
    const fail = (why: string): never => {
        throw new Error(`prerender: ${file} ${why}`);
    };
    const grew = html.length - template.length;
    if (grew < 500) fail(`is only ${String(grew)} bytes bigger than the shell — nothing rendered`);
    // `(?:<!--.*?-->)*` because the whole route table sits inside one Suspense boundary, and
    // React opens every boundary with a `<!--$-->` marker before the first real tag.
    if (!/<div id="root"[^>]*>(?:<!--.*?-->)*<[a-z]/.test(html))
        fail("has no element inside its root");
    if (/<title>\s*<\/title>/.test(html)) fail("has an empty <title>");
    if (html.includes("state-block--loading")) fail("shipped a loading spinner as its content");
}

async function write(file: string, contents: string): Promise<void> {
    const target = path.join(DIST, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents, "utf8");
}

/** The content file a page renders, read out of the bundle the browser will be served. */
async function loadContent(page: PublicPage): Promise<PreloadedFile | null> {
    if (!page.contentPath) return null;
    const source = path.join(DIST, page.contentPath.replace(/^\//, ""));
    try {
        return { path: page.contentPath, text: await readFile(source, "utf8") };
    } catch {
        throw new Error(
            `prerender: ${page.path} renders ${page.contentPath}, which is not in dist/ — ` +
                "is the content metadata newer than the installed @falai/agent?"
        );
    }
}

function buildSitemap(): string {
    const urls = PUBLIC_PAGES.filter((page) => !page.canonicalPath)
        .map((page) =>
            [
                "  <url>",
                `    <loc>${SITE_URL}${page.path}</loc>`,
                `    <changefreq>${page.changeFrequency}</changefreq>`,
                `    <priority>${page.priority.toFixed(1)}</priority>`,
                "  </url>",
            ].join("\n")
        )
        .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main(): Promise<void> {
    const { renderPage } = await loadRenderer();
    const template = await loadTemplate();

    let written = 0;

    for (const page of PUBLIC_PAGES) {
        const preloaded = await loadContent(page);
        const description =
            page.description ||
            (preloaded ? describe(preloaded.text) : "") ||
            FALLBACK_DESCRIPTION;

        const { file, html } = bake(
            template,
            page,
            { route: page.path, html: await renderPage(page.path, preloaded) },
            preloaded,
            description
        );
        assertRendered(file, html, template);
        await write(file, html);
        written += 1;
    }

    // The not-found page, as a real file. Firebase serves `404.html` with a 404 status for every
    // address that has none — which is only true now that the catch-all rewrite is gone from
    // firebase.json. It carries the shell route rather than its own, so a reader who lands here
    // mounts fresh instead of hydrating the not-found page over the address they asked for.
    const notFound: PublicPage = {
        path: NOWHERE,
        title: "Page not found · @falai/agent",
        priority: 0,
        changeFrequency: "monthly",
    };
    const { html: shell } = bake(
        template,
        notFound,
        { route: SHELL_ROUTE, html: await renderPage(NOWHERE, null) },
        null,
        FALLBACK_DESCRIPTION
    );
    assertRendered("404.html", shell, template);
    await write(
        "404.html",
        // A 404 must not be indexed, and must not claim to be a page: the canonical baked above
        // points at `/__not-found__`, an address that does not exist.
        shell
            .replace(/\s*<link rel="canonical"[^>]*>/, "")
            .replace("</head>", '    <meta name="robots" content="noindex" />\n  </head>')
    );
    written += 1;

    await write("sitemap.xml", buildSitemap());
    await write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

    console.log(`· prerendered ${String(written)} files + sitemap.xml + robots.txt`);
    process.exit(0);
}

await main();
