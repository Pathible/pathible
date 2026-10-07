// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useTheme } from "next-themes";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <Controls />
    </ThemeProvider>
  );
}
function Controls() {
  const { setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme("dark")}>
      Use dark theme
    </button>
  );
}
function scriptErrors(spy: { mock: { calls: unknown[][] } }) {
  return spy.mock.calls.filter((args) =>
    args.some((value) => typeof value === "string" && value.includes("Encountered a script tag")),
  );
}
beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("theme bootstrap", () => {
  it("preserves the no-flash script in server-rendered HTML", () => {
    const html = renderToString(<App />);
    expect(html).toContain("<script");
    expect(html).toContain("localStorage");
    expect(html.indexOf("<script")).toBeLessThan(html.indexOf("<button"));
  });
  it("does not create an inert inline script on a fresh client mount or remount", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const first = render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Use dark theme" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    first.unmount();
    const second = render(<App />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(second.container.querySelector("script")).toBeNull();
    expect(scriptErrors(errors)).toHaveLength(0);
  });
  it("hydrates server markup without mismatch and keeps theme switching functional", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    container.innerHTML = renderToString(<App />);
    document.body.appendChild(container);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <App />);
    });
    fireEvent.click(screen.getByRole("button", { name: "Use dark theme" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(errors.mock.calls).toEqual([]);
    await act(async () => root?.unmount());
    container.remove();
  });
});
