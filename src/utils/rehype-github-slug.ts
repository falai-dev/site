import { visit } from "unist-util-visit";
import { githubSlug } from "./github-slug";
import type { Root, Element } from "hast";

/**
 * Rehype plugin to add GitHub-style IDs to headings
 */
export function rehypeGithubSlug() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName && /^h[1-6]$/.test(node.tagName)) {
        // Extract text content from heading
        const text = extractText(node);
        if (text) {
          const id = githubSlug(text);
          if (!node.properties) {
            node.properties = {};
          }
          node.properties.id = id;
        }
      }
    });
  };
}

// oxlint-disable-next-line typescript/no-explicit-any
function extractText(node: any): string {
  if (node.type === "text") {
    return node.value;
  }
  if (node.children) {
    return node.children.map(extractText).join("");
  }
  return "";
}
