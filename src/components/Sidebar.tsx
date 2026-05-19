import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { docs, examples, docTypeLabel, type ContentCategory, type ContentItem } from "../lib/content";

interface SidebarProps {
  onNavigate?: () => void;
}

function filterCategories(categories: ContentCategory[], query: string): ContentCategory[] {
  if (!query) return categories;
  const needle = query.trim().toLowerCase();
  return categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.title.toLowerCase().includes(needle) ||
          item.slug.includes(needle) ||
          item.type.includes(needle)
      ),
    }))
    .filter((cat) => cat.items.length > 0);
}

function NavList({
  categories,
  basePath,
  query,
  onNavigate,
}: {
  categories: ContentCategory[];
  basePath: "/docs" | "/examples";
  query: string;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const filtered = useMemo(() => filterCategories(categories, query), [categories, query]);

  if (filtered.length === 0) {
    return <p className="sidebar__empty">No matches.</p>;
  }

  return (
    <>
      {filtered.map((category) => (
        <div key={category.slug} className="sidebar__group">
          <h4 className="sidebar__group-title">{category.title}</h4>
          <ul className="sidebar__items">
            {category.items.map((item: ContentItem) => {
              const to = `${basePath}/${category.slug}/${item.slug}`;
              const active = location.pathname === to;
              return (
                <li key={`${category.slug}-${item.slug}`}>
                  <Link
                    to={to}
                    className={`sidebar__link${active ? " is-active" : ""}`}
                    onClick={onNavigate}
                  >
                    <span className="sidebar__link-label">{item.title}</span>
                    <span className={`badge badge--${item.type}`}>
                      {item.language ? item.language : docTypeLabel[item.type]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [query, setQuery] = useState("");
  const location = useLocation();

  const isExamples = location.pathname.startsWith("/examples");

  return (
    <aside className="sidebar" aria-label={isExamples ? "Examples navigation" : "Documentation navigation"}>
      <div className="sidebar__search">
        <input
          type="search"
          placeholder="Filter…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={isExamples ? "Filter examples" : "Filter documentation"}
        />
      </div>

      {isExamples ? (
        <section className="sidebar__section">
          <h3 className="sidebar__section-title">Examples</h3>
          <nav>
            <NavList categories={examples} basePath="/examples" query={query} onNavigate={onNavigate} />
          </nav>
        </section>
      ) : (
        <section className="sidebar__section">
          <h3 className="sidebar__section-title">Documentation</h3>
          <nav>
            <NavList categories={docs} basePath="/docs" query={query} onNavigate={onNavigate} />
          </nav>
        </section>
      )}
    </aside>
  );
}
