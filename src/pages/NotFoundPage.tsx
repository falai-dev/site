import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1>Page not found</h1>
      <p>The page you’re looking for doesn’t exist or has moved.</p>
      <div className="not-found__actions">
        <Link to="/" className="btn btn--primary">
          Home
        </Link>
        <Link to="/docs" className="btn btn--ghost">
          Docs
        </Link>
      </div>
    </div>
  );
}
