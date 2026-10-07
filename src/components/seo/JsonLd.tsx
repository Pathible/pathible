interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Component for injecting JSON-LD structured data into the page.
 * Use this for SEO-rich structured data that search engines and AI systems can parse.
 *
 * @example
 * <JsonLd data={organizationSchema} />
 * <JsonLd data={[organizationSchema, websiteSchema]} />
 */
export function JsonLd({ data }: JsonLdProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((item) => {
        // Use the @type or @id as a stable key, fallback to stringified content hash
        const schemaType = (item["@type"] as string) || (item["@id"] as string) || "schema";
        const key = `json-ld-${schemaType}`;

        return (
          <script
            key={key}
            id={key}
            type="application/ld+json"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD structured data injection
            dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
          />
        );
      })}
    </>
  );
}
