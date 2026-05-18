import { Link } from "react-router-dom";
import { docs, docTypeLabel } from "../lib/content";

export function DocsOverviewPage() {
  return (
    <div className="overview">
      <header className="overview__header">
        <h1>Documentation</h1>
        <p>Guides, references, and architecture notes for @falai/agent.</p>
      </header>

      <div className="overview__grid">
        {docs.map((category) => (
          <article key={category.slug} className="overview-card">
            <h2>{category.title}</h2>
            <ul>
              {category.items.map((item) => (
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
