import { Link } from "react-router-dom";
import { MarkdownViewer } from "../components/MarkdownViewer";
import { docs, docTypeLabel } from "../lib/content";

const hasRootReadme = docs.some(
  (c) => c.slug === "overview" && c.items.some((i) => i.slug === "readme")
);

export function DocsOverviewPage() {
  if (hasRootReadme) {
    return (
      <div className="doc-page">
        <MarkdownViewer path="/content/docs/README.md" />
      </div>
    );
  }

  return (
    <div className="overview">
      <header className="overview__header">
        <h1>Documentation</h1>
        <p>Guides, references, and architecture notes.</p>
      </header>

      <div className="overview__grid">
        {docs.map((category) => (
          <article key={category.slug} className="overview-card">
            <h2>{category.title}</h2>
            <ul>
              {category.items
                .filter((item) => !item.hidden)
                .map((item) => (
                  <li key={`${category.slug}-${item.slug}`}>
                    <Link to={`/docs/${category.slug}/${item.slug}`}>
                      <span>{item.title}</span>
                      <span className={`badge badge--${item.type}`}>
                        {docTypeLabel[item.type]}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
