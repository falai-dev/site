import { useEffect, useState, type ReactNode } from "react";
import ShikiHighlighter from "react-shiki/core";
import { normalizeLanguage } from "../lib/languages";
import { PlainCodeBlock } from "./PlainCodeBlock";

/** The highlighter, as it exists once its module has loaded. */
type Highlighter = (typeof import("../lib/highlighter"))["highlighter"];

interface CodeBlockProps {
    /** Source code, raw. */
    code: string;
    /** Language hint (matches Shiki language names). */
    language?: string | null;
    /** Optional filename or label shown in the header. */
    filename?: string;
    /** When true, hide the chrome (header/copy). Used for inline-ish blocks. */
    bare?: boolean;
}

export function CodeBlock({ code, language, filename, bare = false }: CodeBlockProps) {
    const lang = normalizeLanguage(language);

    // The highlighter arrives after mount, never before. It is a Shiki core with a WebAssembly
    // engine behind a top-level `await`, so a static import would drag all of it into whatever
    // chunk this component lands in — and into the build's Bun render, which has no use for it
    // and cannot run it. Fetching it here also means the server's markup and the browser's first
    // render are the same plain block, which is what makes hydration match.
    const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

    useEffect(() => {
        let cancelled = false;
        void import("../lib/highlighter").then((module) => {
            if (!cancelled) setHighlighter(module.highlighter);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <PlainCodeBlock code={code} label={filename ?? lang} bare={bare}>
            {highlighter && (
                <ShikiHighlighter
                    highlighter={highlighter}
                    language={lang}
                    theme={{ light: "github-light-default", dark: "github-dark-default" }}
                    defaultColor="light-dark()"
                    showLanguage={false}
                    addDefaultStyles={false}
                    className="code-block__shiki"
                >
                    {code}
                </ShikiHighlighter>
            )}
        </PlainCodeBlock>
    );
}

/**
 * Adapter for use as the `code` component in react-markdown. Distinguishes
 * fenced blocks (rendered via CodeBlock) from inline code (rendered as a
 * simple <code>).
 */
export function MarkdownCode({
    inline,
    className,
    children,
    ...rest
}: {
    inline?: boolean;
    className?: string;
    children?: ReactNode;
}) {
    const text = String(children ?? "").replace(/\n$/, "");
    const match = /language-([\w-]+)/.exec(className ?? "");

    // react-markdown v9+ no longer sets `inline` reliably; treat lack of newline
    // and absence of a language class as inline.
    const isInline = inline ?? (!match && !text.includes("\n"));

    if (isInline) {
        return (
            <code className={className} {...rest}>
                {children}
            </code>
        );
    }

    return <CodeBlock code={text} language={match?.[1]} />;
}
