import { Component, type ErrorInfo, type ReactNode } from "react";

interface SectionBoundaryProps {
  /** Used in the log line and in the message shown to the visitor. */
  name: string;
  children: ReactNode;
}

/**
 * Keeps one failed section — most often a chunk that never arrived over a weak
 * connection — from taking down the rest of the page. Booking stays usable even
 * when the gallery or testimonials never load.
 */
class SectionBoundary extends Component<
  SectionBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Section "${this.props.name}" failed to load:`, error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section className="py-10 px-4 text-center">
        <p className="font-body text-primary-foreground/50 text-sm">
          The {this.props.name} section didn&apos;t load.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 font-body text-sm underline text-primary-foreground/70 hover:text-primary-foreground"
        >
          Retry
        </button>
      </section>
    );
  }
}

export default SectionBoundary;
