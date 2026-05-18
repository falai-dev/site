import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  /** Hide sidebar (used on landing). */
  bare?: boolean;
}

export function Layout({ bare = false }: LayoutProps) {
  const location = useLocation();

  // Scroll to top or hash target on navigation.
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  return (
    <div className={`app${bare ? " app--bare" : ""}`}>
      <Header />
      {bare ? (
        <main className="content content--bare">
          <Outlet />
        </main>
      ) : (
        <div className="layout">
          <Sidebar />
          <main className="content">
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
}
