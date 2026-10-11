import { useId, useState } from "react";
import { Download, Share, Smartphone } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";

const actionClassName =
  "inline-flex min-h-[44px] items-center justify-center gap-2 px-4 py-3 font-body text-sm font-semibold bg-accent text-accent-foreground transition-colors hover:bg-accent/90 active:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary disabled:cursor-wait disabled:opacity-60";

export default function InstallAppCard() {
  const {
    platform, canInstall, isInstalled, isDismissed, isInstalling,
    installError, install, dismiss,
  } = usePwaInstall();
  const [showInstructions, setShowInstructions] = useState(false);
  const titleId = useId();
  const instructionsId = useId();

  if (
    isInstalled || isDismissed || platform === "other" ||
    (platform === "android" && !canInstall && !installError)
  ) {
    return null;
  }

  return (
    <aside
      aria-labelledby={titleId}
      className="mt-8 border border-accent/40 p-5 sm:p-6 text-left"
    >
      <div className="flex items-start gap-3">
        <Smartphone size={24} aria-hidden="true" className="mt-1 shrink-0 text-accent" />
        <div className="min-w-0">
          <h3 id={titleId} className="font-display text-2xl uppercase tracking-wide text-primary-foreground">
            Book faster next time
          </h3>
          <p className="mt-2 font-body text-sm leading-relaxed text-primary-foreground/80">
            Save Ali's Barber Shop to your phone and open your next booking with one tap.
          </p>
        </div>
      </div>

      {installError && platform === "android" && (
        <p role="status" className="mt-4 font-body text-sm leading-relaxed text-primary-foreground/80">
          The installation prompt couldn't open. In Chrome, tap the menu ⋮, then Add to home screen or Install app.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {platform === "ios" ? (
          <button
            type="button"
            aria-expanded={showInstructions}
            aria-controls={instructionsId}
            onClick={() => setShowInstructions((shown) => !shown)}
            className={actionClassName}
          >
            <Share size={18} aria-hidden="true" className="shrink-0" />
            How to save on iPhone
          </button>
        ) : canInstall ? (
          <button
            type="button"
            disabled={isInstalling}
            onClick={install}
            className={actionClassName}
          >
            <Download size={18} aria-hidden="true" className="shrink-0" />
            {isInstalling ? "Opening…" : "Install app"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className="min-h-[44px] px-4 py-3 font-body text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground hover:bg-primary-foreground/5 active:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          Maybe later
        </button>
      </div>

      {platform === "ios" && (
        <div id={instructionsId} hidden={!showInstructions} className="mt-4 border-t border-primary-foreground/20 pt-4 font-body text-sm leading-relaxed text-primary-foreground/80">
          <p>Open this page in Safari, then:</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 marker:text-accent">
            <li>
              Tap <Share size={16} aria-hidden="true" className="inline align-text-bottom text-accent" />{" "}
              <strong className="font-semibold text-primary-foreground">Share</strong> in the browser menu.
            </li>
            <li>Choose <strong className="font-semibold text-primary-foreground">Add to Home Screen</strong>.</li>
            <li>Keep <strong className="font-semibold text-primary-foreground">Open as Web App</strong> on if shown, then tap <strong className="font-semibold text-primary-foreground">Add</strong>.</li>
          </ol>
        </div>
      )}
    </aside>
  );
}
