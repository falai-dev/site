# @falai/agent documentation site

The docs and code examples for [@falai/agent](https://falai.dev). Built with React, TypeScript and Vite.

## Run locally

Install [Bun](https://bun.sh), then install the dependencies:

```bash
bun install
```

Start the site:

```bash
bun run dev
```

Open <http://localhost:5173>. The command reads the docs and examples from the installed `@falai/agent` package and generates `src/content-metadata.json` for the routes and sidebar.

## Update the content

Docs live in the agent package, not this repo. After a new package version is published, update it and regenerate the metadata:

```bash
bun run sync
```

To regenerate metadata without updating the package, run `bun run metadata`.

## Check your changes

```bash
bun run lint
bun run typecheck
```

Lint checks the site copy for em dashes, including escaped strings and HTML entities. Use a period, comma, colon or parentheses instead. Internal source comments are not copy.

## Build

```bash
bun run build
```

The build checks the package docs and examples before copying them. If that check fails, fix the copy in `@falai/agent`, publish the corrected version, then run `bun run sync` here. Do not strip punctuation from the content at runtime.

The `dist` folder contains the rendered HTML for each page, the browser assets, the docs and examples under `/content`, a sitemap, robots.txt and a 404 page. `dist-ssr` is the server-rendering bundle used by the build; it is not the site to upload.

Preview the built site with `bun run preview`. Deploy `dist` to a static host such as Cloudflare Pages, Netlify or Vercel.

## Edit the site

- `src/pages`: landing page, docs and examples pages.
- `src/components`: navigation, Markdown and code viewers.
- `src/config/publicPages.ts`: page titles and descriptions.
- `src/App.css` and `src/index.css`: styles.
- `scripts/metadata.ts`: content routes and sidebar data.
- `scripts/prerender.ts`: rendered pages and search metadata.
- `vite.config.ts`: copies the package content into the build.

MIT © 2025
