AHGUIAHUIAHUIA

# 🤖 @falai/agent Documentation Site

Documentation website for the `@falai/agent` framework - Build intelligent, conversational AI agents with TypeScript.

## 🚀 Features

- ✨ **Automated Content Generation**: Automatically fetches and renders documentation from `@falai/agent` package
- 📚 **Documentation Pages**: All docs from the package's `/docs` folder rendered with syntax highlighting
- 💻 **Live Examples**: Interactive code examples from the package's `/examples` folder
- 🎨 **Modern UI**: Beautiful, responsive design with dark theme
- ⚡ **Fast Performance**: Built with Vite + React for lightning-fast development and builds
- 🔍 **Type-Safe**: Full TypeScript support throughout

## 📦 Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Package Manager**: Bun
- **Routing**: React Router v7
- **Markdown Rendering**: react-markdown with remark-gfm
- **Syntax Highlighting**: rehype-highlight with highlight.js
- **Linting**: ESLint with TypeScript support

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) 1.0+ (recommended) or Node.js 18+
- The `@falai/agent` package is automatically included as a dependency

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd falai-site

# Install dependencies
bun install
```

### Development Server

```bash
# Start development server (includes metadata generation)
bun run dev
```

The site will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the site
bun run build

# Preview the production build
bun run preview
```

### Other Commands

```bash
# Generate content metadata from @falai/agent package
bun run metadata

# Run type checking
bun run typecheck

# Run linter
bun run lint
```

## 📁 Project Structure

```
falai-site/
├── scripts/
│   └── generate-content-metadata.ts  # Generates metadata from @falai/agent package
├── src/
│   ├── components/
│   │   ├── CodeViewer.tsx           # Renders code examples
│   │   ├── Header.tsx               # Site header with navigation
│   │   ├── Layout.tsx               # Main layout wrapper
│   │   ├── MarkdownViewer.tsx       # Renders markdown documentation
│   │   └── Sidebar.tsx              # Sidebar navigation
│   ├── pages/
│   │   ├── DocPage.tsx              # Individual documentation page
│   │   ├── ExamplePage.tsx          # Individual example page
│   │   └── HomePage.tsx             # Landing page with README
│   ├── App.tsx                      # Main app component with routing
│   ├── App.css                      # Global styles
│   └── content-metadata.json        # Auto-generated metadata
├── vite.config.ts                   # Vite configuration
└── package.json
```

## 🔄 How It Works

1. **Metadata Generation**: The `scripts/metadata.ts` script scans the `@falai/agent` package for documentation and examples
2. **Static Content Copy**: Vite plugin copies markdown and code files to the build output
3. **Dynamic Routing**: React Router creates routes for all docs and examples based on metadata
4. **Runtime Fetching**: Content is fetched at runtime and rendered with syntax highlighting

## 🎨 Customization

### Styling

The site uses CSS custom properties (CSS variables) for easy theming. Edit `src/App.css` to customize:

```css
:root {
  --bg-primary: #0a0a0b;
  --accent-primary: #6366f1;
  /* ... more variables */
}
```

### Content

The documentation content is automatically sourced from the `@falai/agent` package. To update:

1. Update the `@falai/agent` package version in `package.json`
2. Run `bun install`
3. Run `bun run metadata` to update metadata
4. Build or start dev server

## 🚢 Deployment

The site is a static SPA that can be deployed to any static hosting service:

- **Vercel**: Connect your repository and deploy automatically
- **Netlify**: Same as Vercel, with automatic builds
- **GitHub Pages**: Deploy the `dist` folder
- **Cloudflare Pages**: Connect and deploy

### Build Output

The `dist` folder contains:

- Static HTML, CSS, and JS
- `/content/` directory with all markdown and code files
- Optimized and minified assets

## 📝 License

MIT © 2025

---

**Built with ❤️ for the @falai/agent community**
