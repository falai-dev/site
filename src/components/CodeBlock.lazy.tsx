import { lazy, Suspense } from "react";
import { PlainCodeBlock } from "./PlainCodeBlock";

const CodeBlockInner = lazy(() =>
    import("./CodeBlock").then((m) => ({ default: m.CodeBlock }))
);

interface LazyCodeBlockProps {
    code: string;
    language?: string;
    /**
     * Required, unlike on `CodeBlock`. The fallback below has to label the block exactly as the
     * loaded component will, and only `CodeBlock` can work a label out from the language.
     */
    filename: string;
}

/**
 * Lazy wrapper around CodeBlock, so the landing page ships none of Shiki's React binding.
 *
 * The fallback is the same `PlainCodeBlock` the loaded component renders before it has a
 * highlighter, so the swap changes the colours and nothing else — no layout shift, and markup a
 * prerendered page can be hydrated from.
 */
export function LazyCodeBlock({ code, language, filename }: LazyCodeBlockProps) {
    return (
        <Suspense fallback={<PlainCodeBlock code={code} label={filename} />}>
            <CodeBlockInner code={code} language={language} filename={filename} />
        </Suspense>
    );
}
