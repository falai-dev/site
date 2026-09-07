import { useState, type ReactNode } from "react";

interface PlainCodeBlockProps {
    /** Source code, raw. */
    code: string;
    /** Filename or language shown in the header. */
    label: string;
    /** When true, hide the chrome (header/copy). Used for inline-ish blocks. */
    bare?: boolean;
    /** The highlighted body, once there is one. Without it the source shows as plain text. */
    children?: ReactNode;
}

/**
 * A code block with its chrome, showing the source as plain text.
 *
 * This is what every reader sees first. Shiki highlights inside an effect, so its own first
 * render is empty — which used to mean a blank box for a moment on every page, an empty box
 * forever for a reader whose JavaScript never arrives, and nothing at all in the prerendered
 * HTML a search engine reads. Showing the source is strictly better than showing nothing, and
 * it costs a `<pre>`.
 *
 * Both `CodeBlock` and the fallback in `CodeBlock.lazy` render through here so the markup around
 * the code is identical in all three states. That is what lets the browser hydrate a prerendered
 * page rather than throw it away and rebuild it.
 */
export function PlainCodeBlock({ code, label, bare = false, children }: PlainCodeBlockProps) {
    const [copied, setCopied] = useState(false);

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
                    <span className="code-block__lang">{label}</span>
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
            {children ?? (
                <pre className="code-block__shiki">
                    <code>{code}</code>
                </pre>
            )}
        </figure>
    );
}
