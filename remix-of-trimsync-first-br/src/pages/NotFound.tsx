import { useEffect } from "react";

// Note: this page is only reached in development now. In production Apache
// serves the prerendered /404.html with a real HTTP 404 status — previously
// every unknown URL rendered this component behind an HTTP 200, which is a
// soft 404 across the entire URL space.
const NotFound = () => {
  useEffect(() => {
    // Read inside the effect so the component can render during prerendering.
    console.error(
      "404 Error: User attempted to access non-existent route:",
      window.location.pathname
    );
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
