import { lazy, Suspense } from "react";

const CodeBlockInner = lazy(() =>
    import("./CodeBlock").then((m) => ({ default: m.CodeBlock }))
);

interface LazyCodeBlockProps {
    code: string;
    language?: string;
    filename?: string;
}

/**
 * Lazy wrapper around CodeBlock. While the highlighter chunk is loading we
 * render a plain, unstyled-but-readable code block as fallback, so the page
 * is usable instantly. Once Shiki resolves, the highlighted version takes
 * over without layout shift.
 */
export function LazyCodeBlock({ code, language, filename }: LazyCodeBlockProps) {
    return (
        <Suspense fallback={<CodeFallback code={code} filename={filename ?? language} />}>
            <CodeBlockInner code={code} language={language} filename={filename} />
        </Suspense>
    );
}

function CodeFallback({ code, filename }: { code: string; filename?: string }) {
    return (
        <figure className="code-block">
            <header className="code-block__header">
                <span className="code-block__lang">{filename}</span>
            </header>
            <pre className="code-block__shiki">
                <code>{code}</code>
            </pre>
        </figure>
    );
}
