import { useContentFile } from "../lib/content-file";
import { CodeBlock } from "./CodeBlock";

interface CodeViewerProps {
  path: string;
  language: string;
  title: string;
}

export function CodeViewer({ path, language, title }: CodeViewerProps) {
  const { text, loading, error } = useContentFile(path);

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
      <CodeBlock code={text} language={language} filename={`${title}.${language === "prisma" ? "prisma" : "ts"}`} />
    </section>
  );
}
