import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { rehypeGithubSlug } from "../utils/rehype-github-slug";
import { rewriteMarkdownLink } from "../lib/content";
import "highlight.js/styles/github-dark.css";

interface MarkdownViewerProps {
  /** Path to the markdown file under /content (e.g. /content/docs/foo.md). */
  path: string;
}

interface AnchorProps {
  href?: string;
  children?: React.ReactNode;
}

function buildLinkComponent(currentPath: string) {
  return function MarkdownLink({ href, children, ...rest }: AnchorProps) {
    if (!href) return <a {...rest}>{children}</a>;

    // External links open in a new tab.
    if (/^[a-z]+:\/\//i.test(href) || href.startsWith("mailto:")) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    }

    // Pure anchor stays on the page.
    if (href.startsWith("#")) {
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      );
    }

    // Internal cross-document link — try to map back to a known route.
    const internal = rewriteMarkdownLink(currentPath, href);
    if (internal) {
      const target = internal.hash ? `${internal.to}#${internal.hash}` : internal.to;
      return (
        <Link to={target} {...rest}>
          {children}
        </Link>
      );
    }

    // Fallback to plain anchor (likely a static asset).
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  };
}

export function MarkdownViewer({ path }: MarkdownViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load content: ${res.statusText}`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        // Strip frontmatter from the rendered output.
        const stripped = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
        setContent(stripped);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  if (loading) {
    return (
      <div className="state-block state-block--loading" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <span>Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-block state-block--error" role="alert">
        <strong>Couldn't load this page</strong>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <article className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeGithubSlug, rehypeHighlight]}
        components={{ a: buildLinkComponent(path) }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
