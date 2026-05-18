import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface CodeViewerProps {
  path: string;
  language: string;
  title: string;
}

export function CodeViewer({ path, language, title }: CodeViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load example: ${res.statusText}`);
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        setContent(text);
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop — clipboard unavailable */
    }
  };

  if (loading) {
    return (
      <div className="state-block state-block--loading" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <span>Loading example…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-block state-block--error" role="alert">
        <strong>Couldn't load this example</strong>
        <span>{error}</span>
      </div>
    );
  }

  const fenced = `\`\`\`${language}\n${content}\n\`\`\``;

  return (
    <section className="code-viewer">
      <header className="code-viewer__header">
        <div>
          <span className="code-viewer__lang">{language}</span>
          <h1 className="code-viewer__title">{title}</h1>
        </div>
        <button type="button" className="code-viewer__copy" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </header>
      <div className="code-viewer__body">
        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{fenced}</ReactMarkdown>
      </div>
    </section>
  );
}
