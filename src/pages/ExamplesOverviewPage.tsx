import { Link } from "react-router-dom";
import { examples } from "../lib/content";

export function ExamplesOverviewPage() {
  return (
    <div className="overview">
      <header className="overview__header">
        <h1>Examples</h1>
        <p>Runnable code that shows the framework in action.</p>
      </header>

      <div className="examples-grid">
        {examples.map((category) =>
          category.items.map((item) => (
            <Link
              key={`${category.slug}-${item.slug}`}
              to={`/examples/${category.slug}/${item.slug}`}
              className="example-card"
            >
              <h3 className="example-card__title">{item.title}</h3>
              {item.description && (
                <p className="example-card__desc">{item.description}</p>
              )}
              {item.teaches && (
                <div className="example-card__teaches">
                  {item.teaches.split(",").map((t) => (
                    <span key={t.trim()} className="example-card__badge">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}
              {item.language && (
                <span className="badge badge--example example-card__lang">
                  {item.language}
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
