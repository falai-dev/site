import { useState, type ReactNode } from "react";
import ShikiHighlighter from "react-shiki/core";
import { highlighter, normalizeLanguage } from "../lib/highlighter";

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
    const [copied, setCopied] = useState(false);
    const lang = normalizeLanguage(language);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard unavailable */
        }
    };

    return (
        <figure className={`code-block${bare ? " code-block--bare" : ""}`}>
            {!bare && (
                <header className="code-block__header">
                    <span className="code-block__lang">{filename ?? lang}</span>
                    <button
                        type="button"
                        className="code-block__copy"
                        onClick={handleCopy}
                        aria-label="Copy code"
                    >
                        {copied ? "Copied" : "Copy"}
                    </button>
                </header>
            )}
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
        </figure>
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
