import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/docs/getting-started" className="btn btn-secondary">
            View Docs
          </Link>
        </div>
      </div>
    </div>
  );
}
