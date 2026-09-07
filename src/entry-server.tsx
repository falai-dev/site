// One page, as markup — the build-time half of `main.tsx`.
//
// The same `<App />` and the same route table the browser runs; only the router differs, because
// the build has no history to browse, and the content file arrives as a value instead of a fetch.
import { StrictMode } from "react";
import { prerender } from "react-dom/static.browser";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { PreloadedFileContext, type PreloadedFile } from "./lib/content-file";

/**
 * @public — imported by `scripts/prerender.ts` out of the BUILT bundle, so no source file
 * references it.
 */
export async function renderPage(
    routePath: string,
    preloaded: PreloadedFile | null
): Promise<string> {
    // React treats most render errors as recoverable and logs them. A build must not: a page that
    // threw is a page whose markup is wrong, and shipping it silently is the failure mode this
    // whole script exists to end.
    let failure: unknown;

    // `prerender` rather than `renderToString`: every route below the landing page is `lazy()`,
    // and `renderToString` renders a Suspense FALLBACK instead of waiting for it — which would
    // quietly bake "Loading…" into all 40-odd documentation pages with every gate still green.
    const { prelude } = await prerender(
        <StrictMode>
            <PreloadedFileContext.Provider value={preloaded}>
                <StaticRouter location={routePath}>
                    <App />
                </StaticRouter>
            </PreloadedFileContext.Provider>
        </StrictMode>,
        {
            onError(error: unknown) {
                failure ??= error;
            },
        }
    );

    const html = await new Response(prelude).text();
    if (failure !== undefined) throw failure;
    return html;
}
