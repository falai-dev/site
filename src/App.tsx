import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import "./App.css";

// Doc/example surfaces are split out so the landing page ships minimal JS.
const DocPage = lazy(() => import("./pages/DocPage").then((m) => ({ default: m.DocPage })));
const DocsOverviewPage = lazy(() =>
  import("./pages/DocsOverviewPage").then((m) => ({ default: m.DocsOverviewPage }))
);
const ExamplePage = lazy(() => import("./pages/ExamplePage").then((m) => ({ default: m.ExamplePage })));
const ExamplesOverviewPage = lazy(() =>
  import("./pages/ExamplesOverviewPage").then((m) => ({ default: m.ExamplesOverviewPage }))
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage }))
);

function PageFallback() {
  return (
    <div className="state-block state-block--loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>Loading…</span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<Layout bare />}>
            <Route path="/" element={<HomePage />} />
          </Route>
          <Route element={<Layout />}>
            <Route path="/docs" element={<DocsOverviewPage />} />
            <Route path="/docs/:categorySlug/:itemSlug" element={<DocPage />} />
            <Route path="/examples" element={<ExamplesOverviewPage />} />
            <Route path="/examples/:categorySlug/:itemSlug" element={<ExamplePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
