import contentMetadata from "../content-metadata.json";

export type DocType =
    | "overview"
    | "tutorial"
    | "guide"
    | "reference"
    | "concept"
    | "migration"
    | "meta"
    | "example";

export interface ContentItem {
    slug: string;
    title: string;
    path: string;
    type: DocType;
    order: number;
    language?: string;
}

export interface ContentCategory {
    slug: string;
    title: string;
    items: ContentItem[];
}

export const docs = contentMetadata.docs as ContentCategory[];
export const examples = contentMetadata.examples as ContentCategory[];
export const version = contentMetadata.version as string;

export interface ResolvedRoute {
    kind: "doc" | "example";
    categorySlug: string;
    itemSlug: string;
    item: ContentItem;
}

/**
 * Build a lookup table from content paths (e.g. /content/docs/foo/bar.md) to
 * route descriptors. Used by the markdown link rewriter.
 */
function buildRouteIndex(): Map<string, ResolvedRoute> {
    const map = new Map<string, ResolvedRoute>();
    for (const category of docs) {
        for (const item of category.items) {
            map.set(item.path, {
                kind: "doc",
                categorySlug: category.slug,
                itemSlug: item.slug,
                item,
            });
        }
    }
    for (const category of examples) {
        for (const item of category.items) {
            map.set(item.path, {
                kind: "example",
                categorySlug: category.slug,
                itemSlug: item.slug,
                item,
            });
        }
    }
    return map;
}

const routeIndex = buildRouteIndex();

export function findRouteByContentPath(contentPath: string): ResolvedRoute | undefined {
    return routeIndex.get(contentPath);
}

/**
 * Resolve a relative or absolute path (as written in markdown) against the
 * content path of the currently rendered document.
 *
 * - Absolute (`/foo`) starts at root.
 * - Relative (`./foo`, `../foo`, `foo.md`) is resolved against the current dir.
 */
export function resolveContentPath(currentContentPath: string, target: string): string {
    if (target.startsWith("/")) return normalizePath(target);

    const baseDir = currentContentPath.replace(/\/[^/]*$/, "");
    const segments = baseDir.split("/").filter(Boolean);

    for (const part of target.split("/")) {
        if (part === "." || part === "") continue;
        if (part === "..") segments.pop();
        else segments.push(part);
    }

    return "/" + segments.join("/");
}

function normalizePath(path: string): string {
    const segments: string[] = [];
    for (const part of path.split("/")) {
        if (part === "" || part === ".") continue;
        if (part === "..") segments.pop();
        else segments.push(part);
    }
    return "/" + segments.join("/");
}

/**
 * Convert a markdown link (potentially with anchor) to an internal app route
 * if it points to a known doc or example. Returns null when the link is not
 * an internal content link.
 */
export interface InternalLink {
    to: string;
    hash?: string;
}

export function rewriteMarkdownLink(currentContentPath: string, href: string): InternalLink | null {
    if (!href) return null;
    if (/^[a-z]+:\/\//i.test(href) || href.startsWith("mailto:")) return null;

    // Pure anchor — keep as-is in the page.
    if (href.startsWith("#")) return { to: "", hash: href.slice(1) };

    const [pathPart, anchor] = href.split("#");
    if (!/\.(md|ts|prisma)$/i.test(pathPart)) return null;

    const resolved = resolveContentPath(currentContentPath, pathPart);
    const route = findRouteByContentPath(resolved);
    if (!route) return null;

    const base = route.kind === "doc" ? "/docs" : "/examples";
    return {
        to: `${base}/${route.categorySlug}/${route.itemSlug}`,
        hash: anchor || undefined,
    };
}

/**
 * Display label for a doc-type used in sidebar/list badges.
 */
export const docTypeLabel: Record<DocType, string> = {
    overview: "Overview",
    tutorial: "Tutorial",
    guide: "Guide",
    reference: "Reference",
    concept: "Concept",
    migration: "Migration",
    meta: "Meta",
    example: "Example",
};
