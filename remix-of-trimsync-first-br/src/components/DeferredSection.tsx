import { useEffect, useRef, useState, type ReactNode } from "react";

interface DeferredSectionProps {
  children: ReactNode;
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string;
  /**
   * Height held open before the real section mounts. Only needs to be roughly
   * right — these sections are below the fold, so the placeholder is never
   * visible when it is replaced and cannot cause a layout shift.
   */
  minHeight?: number;
}

/**
 * Mounts its children only once they are near the viewport.
 *
 * React.lazy alone splits the bundle but does not defer the *request*: a lazy
 * component that is rendered unconditionally fetches its chunk immediately, so
 * all the below-the-fold sections were competing with the hero image for
 * bandwidth on first load. Gating the render behind an IntersectionObserver is
 * what actually delays the fetch.
 *
 * Falls back to rendering immediately where IntersectionObserver is missing.
 */
const DeferredSection = ({
  children,
  rootMargin = "600px",
  minHeight = 400,
}: DeferredSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(
    () => typeof IntersectionObserver === "undefined"
  );

  useEffect(() => {
    if (show || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [show, rootMargin]);

  if (show) return <>{children}</>;

  return <div ref={ref} style={{ minHeight }} aria-hidden="true" />;
};

export default DeferredSection;
