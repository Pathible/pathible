// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JsonLd } from "@/components/seo/JsonLd";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("JSON-LD data blocks", () => {
  it("renders structured data directly into server HTML without executable wrappers", () => {
    const data = { "@type": "Organization", name: "Pathible" };
    const html = renderToString(<JsonLd data={data} />);
    expect(html).toContain('type="application/ld+json"');
    expect(html).not.toContain("__next_s");
    expect(html).toContain(JSON.stringify(data));
  });
  it("escapes embedded closing script tags while preserving JSON values", () => {
    const data = { "@type": "Organization", name: "</script><script>alert(1)</script>" };
    const { container } = render(<JsonLd data={data} />);
    const scripts = container.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    expect(scripts[0].textContent).not.toContain("</script>");
    expect(JSON.parse(scripts[0].textContent ?? "")).toEqual(data);
  });
  it("can mount on client navigation without React's executable-script warning", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <JsonLd data={[{ "@type": "Organization" }, { "@type": "WebSite" }]} />,
    );
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
    expect(
      errors.mock.calls.some((args) =>
        args.some(
          (value: unknown) =>
            typeof value === "string" && value.includes("Encountered a script tag"),
        ),
      ),
    ).toBe(false);
  });
});
