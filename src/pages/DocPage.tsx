import { useParams, Navigate, Link } from "react-router-dom";
import { MarkdownViewer } from "../components/MarkdownViewer";
import { docs, getNavNeighbors } from "../lib/content";

export function DocPage() {
  const { categorySlug, itemSlug } = useParams<{ categorySlug?: string; itemSlug?: string }>();

  if (!categorySlug || !itemSlug) {
    return <Navigate to="/docs" replace />;
  }

  const category = docs.find((c) => c.slug === categorySlug);
  const doc = category?.items.find((d) => d.slug === itemSlug);

  if (!doc) {
    return <Navigate to="/docs" replace />;
  }

  const { prev, next } = getNavNeighbors(docs, "/docs", categorySlug, itemSlug);

  return (
    <div className="doc-page">
      <MarkdownViewer path={doc.path} />
      <nav className="page-nav" aria-label="Page navigation">
        {prev ? (
          <Link to={prev.to} className="page-nav__link page-nav__link--prev">
            <span className="page-nav__direction">Previous</span>
            <span className="page-nav__title">{prev.title}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={next.to} className="page-nav__link page-nav__link--next">
            <span className="page-nav__direction">Next</span>
            <span className="page-nav__title">{next.title}</span>
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}
