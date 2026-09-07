import { createContext, useContext, useEffect, useState } from "react";

/**
 * The one file under `/content` this page was rendered with — or null, when the app is running
 * as a plain SPA and has to go and fetch it.
 *
 * The build writes every page to its own HTML file with the document already rendered into the
 * body, and puts the same source beside it in a `<script>` tag. Seeding the first render from
 * that, instead of fetching in an effect, does two things: the browser's first render matches
 * the file it is hydrating, and the reader who landed here never sees "Loading…" for a document
 * that was in the HTML all along.
 */
export interface PreloadedFile {
    /** The content path, e.g. `/content/docs/start/01-install.md`. */
    path: string;
    /** The file, verbatim — frontmatter and all. */
    text: string;
}

export const PreloadedFileContext = createContext<PreloadedFile | null>(null);

export interface ContentFile {
    text: string;
    loading: boolean;
    error: string | null;
}

/**
 * Read a file under `/content`: from the page's preloaded copy when there is one, over the
 * network otherwise.
 *
 * Give the component a `key={path}`. This hook has no stale state to clear when `path` changes
 * because a changed key remounts it — which is also why it can seed its very first state from
 * the preloaded file instead of starting every page on a loading spinner.
 */
export function useContentFile(path: string): ContentFile {
    const preloaded = useContext(PreloadedFileContext);
    const seeded = preloaded?.path === path ? preloaded.text : null;

    const [file, setFile] = useState<ContentFile>(() =>
        seeded === null
            ? { text: "", loading: true, error: null }
            : { text: seeded, loading: false, error: null }
    );

    useEffect(() => {
        if (seeded !== null) return;

        let cancelled = false;
        fetch(path)
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to load content: ${res.statusText}`);
                return res.text();
            })
            .then((text) => {
                if (!cancelled) setFile({ text, loading: false, error: null });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setFile({
                    text: "",
                    loading: false,
                    error: err instanceof Error ? err.message : String(err),
                });
            });

        return () => {
            cancelled = true;
        };
    }, [path, seeded]);

    return file;
}
