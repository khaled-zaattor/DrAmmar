import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import InstallAppCard from "./InstallAppCard";

vi.mock("@/hooks/use-pwa-install", () => ({ usePwaInstall: vi.fn() }));

const install = vi.fn(async () => {});
const dismiss = vi.fn();
const state: ReturnType<typeof usePwaInstall> = {
  platform: "android",
  canInstall: true,
  isInstalled: false,
  isDismissed: false,
  isInstalling: false,
  installError: false,
  install,
  dismiss,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(usePwaInstall).mockReturnValue({ ...state });
});
afterEach(cleanup);

describe("booking confirmation installation card", () => {
  it("opens Android installation only on the customer's click", () => {
    render(<InstallAppCard />);
    expect(install).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Install app" }));
    expect(install).toHaveBeenCalledTimes(1);
  });

  it("explains iPhone installation without invoking the Android prompt", () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...state, platform: "ios", canInstall: false });
    render(<InstallAppCard />);
    const button = screen.getByRole("button", { name: "How to save on iPhone" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Add to Home Screen")).not.toBeVisible();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Add to Home Screen")).toBeVisible();
    expect(screen.getByText("Open as Web App")).toBeVisible();
    expect(install).not.toHaveBeenCalled();
  });

  it.each([
    { isInstalled: true },
    { isDismissed: true },
    { platform: "other" as const },
    { canInstall: false },
  ])("does not offer installation when unavailable: %j", (override) => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...state, ...override });
    const { container } = render(<InstallAppCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("provides manual guidance after a prompt error without a dead install button", () => {
    vi.mocked(usePwaInstall).mockReturnValue({ ...state, canInstall: false, installError: true });
    render(<InstallAppCard />);
    expect(screen.getByRole("status")).toHaveTextContent("The installation prompt couldn't open");
    expect(screen.queryByRole("button", { name: "Install app" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Maybe later" }));
    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});
