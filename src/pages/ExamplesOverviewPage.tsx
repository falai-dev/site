import { Link } from "react-router-dom";
import { examples } from "../lib/content";

export function ExamplesOverviewPage() {
  return (
    <div className="overview">
      <header className="overview__header">
        <h1>Examples</h1>
        <p>Runnable code that shows the framework in action.</p>
      </header>

      <div className="overview__grid">
        {examples.map((category) => (
          <article key={category.slug} className="overview-card">
            <h2>{category.title}</h2>
            <ul>
              {category.items.map((item) => (
                <li key={`${category.slug}-${item.slug}`}>
                  <Link to={`/examples/${category.slug}/${item.slug}`}>
                    <span>{item.title}</span>
                    {item.language && (
                      <span className="badge badge--example">{item.language}</span>
                    )}
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
