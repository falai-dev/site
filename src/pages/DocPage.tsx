import { useParams, Navigate } from "react-router-dom";
import { MarkdownViewer } from "../components/MarkdownViewer";
import { docs } from "../lib/content";

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

  return (
    <div className="doc-page">
      <MarkdownViewer path={doc.path} />
    </div>
  );
}
