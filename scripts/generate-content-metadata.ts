#!/usr/bin/env bun
import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { basename, extname, join, relative, sep } from "path";

/**
 * Doc/example types used for sidebar badges and filtering.
 * Inferred from path when the markdown file has no `type` frontmatter.
 */
type ContentType =
  | "overview"
  | "tutorial"
  | "guide"
  | "reference"
  | "concept"
  | "migration"
  | "meta"
  | "example";

interface ContentItem {
  slug: string;
  title: string;
  path: string;
  type: ContentType;
  order: number;
  language?: string;
}

interface CategoryMetadata {
  slug: string;
  title: string;
  items: ContentItem[];
}

interface ContentMetadata {
  version: string;
  docs: CategoryMetadata[];
  examples: CategoryMetadata[];
}

const DOCS_SOURCE = "node_modules/@falai/agent/docs";
const EXAMPLES_SOURCE = "node_modules/@falai/agent/examples";
const PACKAGE_JSON = "node_modules/@falai/agent/package.json";
const OUTPUT_FILE = "src/content-metadata.json";

const DEFAULT_ORDER = 1000;

// ---------- helpers ----------

function slugify(input: string): string {
  return input
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[_\s/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 4 && word.toUpperCase() === word) return word.toUpperCase();
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Minimal YAML frontmatter parser. Supports flat key/value pairs only.
 * Returns parsed data and stripped body.
 */
function parseFrontmatter(text: string): { data: Record<string, string | number>; body: string } {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: text };

  const data: Record<string, string | number> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    let raw = kv[2].trim();
    raw = raw.replace(/^["'](.*)["']$/, "$1");
    const numeric = Number(raw);
    data[kv[1]] = !isNaN(numeric) && raw !== "" ? numeric : raw;
  }
  return { data, body: text.slice(match[0].length) };
}

function isContentType(value: unknown): value is ContentType {
  return (
    typeof value === "string" &&
    ["overview", "tutorial", "guide", "reference", "concept", "migration", "meta", "example"].includes(value)
  );
}

/**
 * Infer doc-type from path segments. Used when frontmatter doesn't specify one.
 */
function inferDocType(relativePath: string): ContentType {
  const segments = relativePath.split("/").filter(Boolean);
  const file = segments[segments.length - 1].toLowerCase();

  if (file === "contributing.md") return "meta";
  if (segments.length === 1) return "overview";

  const top = segments[0];
  const second = segments[1];

  if (top === "core") return "reference";
  if (top === "api") return "reference";
  if (top === "architecture") return "concept";
  if (top === "guides") {
    if (second === "getting-started") return "tutorial";
    if (second === "migration") return "migration";
    return "guide";
  }
  return "guide";
}

/**
 * Build a unique, route-safe slug from the relative path within a category.
 * Strips the extension, joins folders with hyphens, and special-cases README.md
 * to use the parent folder name.
 *
 * Examples (relative to the docs root):
 *  - core/agent/README.md             -> agent
 *  - core/agent/context-management.md -> agent-context-management
 *  - guides/migration/README.md       -> migration
 *  - architecture/data-extraction.md  -> data-extraction
 *  - error-handling.md                -> error-handling
 */
function buildSlugFromRelativePath(relativeWithinCategory: string): string {
  const segments = relativeWithinCategory.split("/").filter(Boolean);
  const file = segments[segments.length - 1];
  const isReadme = /^readme\.[a-z]+$/i.test(file);
  const parts = isReadme ? segments.slice(0, -1) : [...segments.slice(0, -1), file];
  if (parts.length === 0) return slugify(file.replace(/\.[^.]+$/, ""));
  return slugify(parts.join("-"));
}

/**
 * Build a human title from path/frontmatter. Prefers explicit frontmatter title.
 */
function buildTitle(relativeWithinCategory: string, frontmatterTitle?: string): string {
  if (frontmatterTitle && typeof frontmatterTitle === "string") return frontmatterTitle;
  const segments = relativeWithinCategory.split("/").filter(Boolean);
  const file = segments[segments.length - 1];
  if (/^readme\.[a-z]+$/i.test(file)) {
    if (segments.length >= 2) return titleCase(segments[segments.length - 2]);
    return "Overview";
  }
  return titleCase(basename(file, extname(file)));
}

// ---------- collection ----------

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function readDocItem(absoluteFile: string, categoryRoot: string, urlPrefix: string): ContentItem | null {
  if (!absoluteFile.endsWith(".md")) return null;
  const relWithinCategory = relative(categoryRoot, absoluteFile).split(sep).join("/");
  const text = readFileSync(absoluteFile, "utf-8");
  const { data } = parseFrontmatter(text);

  const slug = buildSlugFromRelativePath(relWithinCategory);
  if (!slug) return null;

  const title = buildTitle(relWithinCategory, data.title as string | undefined);
  const order = typeof data.order === "number" ? data.order : DEFAULT_ORDER;
  const fullRelativeFromDocsRoot = relative(DOCS_SOURCE, absoluteFile).split(sep).join("/");
  const type: ContentType = isContentType(data.type) ? data.type : inferDocType(fullRelativeFromDocsRoot);

  return {
    slug,
    title,
    path: `${urlPrefix}/${relWithinCategory}`,
    type,
    order,
  };
}

function readExampleItem(absoluteFile: string, categoryRoot: string, urlPrefix: string): ContentItem | null {
  const ext = extname(absoluteFile);
  if (ext !== ".ts" && ext !== ".prisma") return null;
  const relWithinCategory = relative(categoryRoot, absoluteFile).split(sep).join("/");
  const slug = buildSlugFromRelativePath(relWithinCategory);
  if (!slug) return null;
  const title = buildTitle(relWithinCategory);
  const language = ext === ".prisma" ? "prisma" : "typescript";

  return {
    slug,
    title,
    path: `${urlPrefix}/${relWithinCategory}`,
    type: "example",
    order: DEFAULT_ORDER,
    language,
  };
}

function dedupeBySlug<T extends { slug: string; title: string }>(items: T[]): T[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const count = seen.get(item.slug) ?? 0;
    seen.set(item.slug, count + 1);
    if (count === 0) return item;
    return { ...item, slug: `${item.slug}-${count + 1}` };
  });
}

function sortItems(items: ContentItem[]): ContentItem[] {
  return [...items].sort((a, b) => {
    // README first within its category
    const aIsReadme = a.slug === "overview" || a.title.toLowerCase() === "overview";
    const bIsReadme = b.slug === "overview" || b.title.toLowerCase() === "overview";
    if (aIsReadme && !bIsReadme) return -1;
    if (!aIsReadme && bIsReadme) return 1;
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });
}

// ---------- generation ----------

function generateDocsMetadata(): CategoryMetadata[] {
  const categories: CategoryMetadata[] = [];
  const entries = readdirSync(DOCS_SOURCE);

  // Top-level files become an "Overview" category.
  const rootItems: ContentItem[] = [];
  for (const entry of entries) {
    const full = join(DOCS_SOURCE, entry);
    if (!statSync(full).isFile()) continue;
    const item = readDocItem(full, DOCS_SOURCE, "/content/docs");
    if (item) rootItems.push(item);
  }
  if (rootItems.length > 0) {
    categories.push({
      slug: "overview",
      title: "Overview",
      items: sortItems(dedupeBySlug(rootItems)),
    });
  }

  // Each top-level directory is its own category, files within it are items.
  const directories = entries.filter((entry) => statSync(join(DOCS_SOURCE, entry)).isDirectory());

  for (const dir of directories) {
    const dirPath = join(DOCS_SOURCE, dir);
    const items: ContentItem[] = [];
    for (const file of walk(dirPath)) {
      const item = readDocItem(file, dirPath, `/content/docs/${dir}`);
      if (item) items.push(item);
    }
    if (items.length > 0) {
      categories.push({
        slug: slugify(dir),
        title: titleCase(dir),
        items: sortItems(dedupeBySlug(items)),
      });
    }
  }

  return categories;
}

function generateExamplesMetadata(): CategoryMetadata[] {
  const categories: CategoryMetadata[] = [];
  const entries = readdirSync(EXAMPLES_SOURCE);

  const rootItems: ContentItem[] = [];
  for (const entry of entries) {
    const full = join(EXAMPLES_SOURCE, entry);
    if (!statSync(full).isFile()) continue;
    const item = readExampleItem(full, EXAMPLES_SOURCE, "/content/examples");
    if (item) rootItems.push(item);
  }
  if (rootItems.length > 0) {
    categories.push({
      slug: "general",
      title: "General",
      items: sortItems(dedupeBySlug(rootItems)),
    });
  }

  const directories = entries.filter((entry) => statSync(join(EXAMPLES_SOURCE, entry)).isDirectory());
  for (const dir of directories) {
    const dirPath = join(EXAMPLES_SOURCE, dir);
    const items: ContentItem[] = [];
    for (const file of walk(dirPath)) {
      const item = readExampleItem(file, dirPath, `/content/examples/${dir}`);
      if (item) items.push(item);
    }
    if (items.length > 0) {
      categories.push({
        slug: slugify(dir),
        title: titleCase(dir),
        items: sortItems(dedupeBySlug(items)),
      });
    }
  }

  return categories;
}

function getPackageVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8"));
    return pkg.version || "unknown";
  } catch (error) {
    console.warn("⚠️  Could not read package version", error);
    return "unknown";
  }
}

function generateMetadata() {
  console.log("📝 Generating content metadata...");

  const metadata: ContentMetadata = {
    version: getPackageVersion(),
    docs: generateDocsMetadata(),
    examples: generateExamplesMetadata(),
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));

  const totalDocs = metadata.docs.reduce((sum, c) => sum + c.items.length, 0);
  const totalExamples = metadata.examples.reduce((sum, c) => sum + c.items.length, 0);

  console.log(
    `✅ ${totalDocs} docs across ${metadata.docs.length} categories, ` +
    `${totalExamples} examples across ${metadata.examples.length} categories`
  );
  console.log(`📦 Package version: ${metadata.version}`);
  console.log(`📄 Written to ${OUTPUT_FILE}`);
}

generateMetadata();
