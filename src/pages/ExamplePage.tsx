import { useParams, Navigate } from "react-router-dom";
import { CodeViewer } from "../components/CodeViewer";
import { examples } from "../lib/content";

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

  return (
    <div className="example-page">
      <CodeViewer path={example.path} language={example.language} title={example.title} />
    </div>
  );
}
