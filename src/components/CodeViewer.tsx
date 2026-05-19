import { useEffect, useState } from "react";
import { CodeBlock } from "./CodeBlock";

interface CodeViewerProps {
  path: string;
  language: string;
  title: string;
}

export function CodeViewer({ path, language, title }: CodeViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <section className="example-page-content">
      <header className="example-page-header">
        <span className="example-page-lang">{language}</span>
        <h1 className="example-page-title">{title}</h1>
      </header>
      <CodeBlock code={content} language={language} filename={`${title}.${language === "prisma" ? "prisma" : "ts"}`} />
    </section>
  );
}
