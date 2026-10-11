export interface Crumb {
  name: string;
  url: string;
}

/**
 * Visible breadcrumbs, matching the BreadcrumbList JSON-LD emitted for the same
 * page. Google wants the markup to correspond to something the user can
 * actually see and click, so these are real links, not decoration.
 */
const Breadcrumbs = ({ trail }: { trail: Crumb[] }) => (
  <nav aria-label="Breadcrumb" className="font-body text-sm">
    <ol className="flex flex-wrap items-center gap-2 list-none p-0 m-0">
      {trail.map((crumb, i) => {
        const isLast = i === trail.length - 1;
        return (
          <li key={crumb.url} className="flex items-center gap-2">
            {isLast ? (
              <span className="text-muted-foreground" aria-current="page">
                {crumb.name}
              </span>
            ) : (
              <>
                <a
                  href={crumb.url}
                  className="text-accent hover:underline"
                >
                  {crumb.name}
                </a>
                <span className="text-muted-foreground/50" aria-hidden="true">
                  /
                </span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumbs;
