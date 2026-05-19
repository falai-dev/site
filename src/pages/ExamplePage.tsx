import { useParams, Navigate, Link } from "react-router-dom";
import { CodeViewer } from "../components/CodeViewer";
import { examples, getNavNeighbors } from "../lib/content";

export function ExamplePage() {
  const { categorySlug, itemSlug } = useParams<{ categorySlug?: string; itemSlug?: string }>();

  if (!categorySlug || !itemSlug) {
    return <Navigate to="/examples" replace />;
  }

  const category = examples.find((c) => c.slug === categorySlug);
  const example = category?.items.find((e) => e.slug === itemSlug);

  if (!example || !example.language) {
    return <Navigate to="/examples" replace />;
  }

  const { prev, next } = getNavNeighbors(examples, "/examples", categorySlug, itemSlug);

  return (
    <div className="example-page">
      <CodeViewer path={example.path} language={example.language} title={example.title} />
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
