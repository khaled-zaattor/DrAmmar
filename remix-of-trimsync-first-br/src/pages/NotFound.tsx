import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // index.html is static and shared by every route, so without this a 404 is
  // served at HTTP 200 carrying the homepage's title, canonical URL and full
  // BarberShop structured data — a soft 404 that competes with the real
  // homepage in search results. Marking it noindex is the cheapest correct fix
  // short of adding a head-management library for one page.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Page Not Found | Ali's Barber Shop";

    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, follow";
    document.head.appendChild(robots);

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const previousCanonical = canonical?.href;
    if (canonical) canonical.href = window.location.href;

    return () => {
      document.title = previousTitle;
      robots.remove();
      if (canonical && previousCanonical) canonical.href = previousCanonical;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
