import { AlertTriangle, Info } from "lucide-react";

/**
 * Shared components for legal content pages (Privacy, Terms)
 * Provides consistent styling for policy documents.
 */

interface BaseProps {
  children: React.ReactNode;
}

interface SectionProps extends BaseProps {
  id: string;
  title: string;
}

interface SubSectionProps extends BaseProps {
  id?: string;
  title: string;
}

interface ListProps {
  items: (string | React.ReactNode)[];
}

interface TableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}

interface NoticeProps extends BaseProps {
  variant?: "warning" | "info";
}

/**
 * Main section with title and anchor ID
 */
export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-crimson text-2xl sm:text-3xl leading-snug text-foreground mb-6 mt-14 pb-3 border-b border-pathible-sage/20">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Subsection with smaller heading
 */
export function SubSection({ id, title, children }: SubSectionProps) {
  return (
    <div id={id} className="scroll-mt-24 mt-8">
      <h3 className="font-crimson text-xl sm:text-2xl leading-snug text-foreground mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

/**
 * Standard paragraph with legal document styling
 */
export function Paragraph({ children }: BaseProps) {
  return (
    <p className="text-muted-foreground leading-relaxed mb-5 text-base sm:text-lg">{children}</p>
  );
}

/**
 * Bold/emphasized text
 */
export function Strong({ children }: BaseProps) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

/**
 * Bullet list with custom styling
 */
export function BulletList({ items }: ListProps) {
  return (
    <ul className="list-none space-y-3 mb-6 pl-0">
      {items.map((item, index) => {
        const key = typeof item === "string" ? item.slice(0, 50) : `bullet-${index}`;
        return (
          <li
            key={key}
            className="text-muted-foreground leading-relaxed text-base sm:text-lg pl-6 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-2 before:h-2 before:bg-pathible-sage/40 before:rounded-full"
          >
            {item}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Numbered list with letter indicators (a, b, c, ...)
 */
export function NumberedList({ items }: ListProps) {
  return (
    <ol className="list-none space-y-3 mb-6 pl-0 counter-reset-list">
      {items.map((item, index) => {
        const key = typeof item === "string" ? item.slice(0, 50) : `numbered-${index}`;
        return (
          <li
            key={key}
            className="text-muted-foreground leading-relaxed text-base sm:text-lg pl-10 relative"
          >
            <span className="absolute left-0 top-0 w-7 h-7 rounded-full bg-pathible-forest/10 flex items-center justify-center text-sm font-medium text-pathible-forest">
              {String.fromCharCode(97 + index)}
            </span>
            {item}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Important notice/callout box
 */
export function ImportantNotice({ children, variant = "warning" }: NoticeProps) {
  const styles = {
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info: "bg-pathible-forest/5 border-pathible-forest/20 text-foreground",
  };

  const Icon = variant === "warning" ? AlertTriangle : Info;
  const iconColor = variant === "warning" ? "text-amber-600" : "text-pathible-forest";

  return (
    <div className={`my-8 p-6 border rounded-2xl ${styles[variant]}`}>
      <div className="flex gap-4">
        <Icon className={`w-6 h-6 shrink-0 mt-0.5 ${iconColor}`} />
        <div className="font-medium">{children}</div>
      </div>
    </div>
  );
}

/**
 * Data table for structured information
 */
export function DataTable({ headers, rows }: TableProps) {
  const headerEntries = headers.map((header, index) => ({
    id: `${header}-${index}`,
    label: header,
  }));

  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-pathible-sage/20 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-pathible-sand/60 border-b border-pathible-sage/20">
          <tr>
            {headerEntries.map((header) => (
              <th
                key={header.id}
                className="px-4 py-3 font-crimson font-semibold text-foreground text-sm sm:text-base whitespace-nowrap"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-pathible-sage/10">
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="transition-colors hover:bg-pathible-sand/30">
              {row.map((cell, cellIndex) => (
                <td
                  key={`cell-${rowIndex}-${cellIndex}`}
                  className="px-4 py-3 text-muted-foreground text-sm sm:text-base"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Contact information card
 */
export function ContactCard({
  title,
  email,
  phone,
  address,
}: {
  title: string;
  email?: string;
  phone?: string;
  address?: string[];
}) {
  return (
    <div className="my-8 p-6 bg-pathible-sand/30 border border-pathible-sage/20 rounded-2xl">
      <h4 className="font-crimson text-lg font-semibold text-foreground mb-4">{title}</h4>
      <div className="space-y-2 text-muted-foreground">
        {email && (
          <p>
            <Strong>Email:</Strong>{" "}
            <a href={`mailto:${email}`} className="text-pathible-forest hover:underline">
              {email}
            </a>
          </p>
        )}
        {phone && (
          <p>
            <Strong>Phone:</Strong> {phone}
          </p>
        )}
        {address && (
          <div>
            <Strong>Address:</Strong>
            <address className="mt-1 not-italic">
              {address.map((line, i) => (
                <span key={`addr-${i}`}>
                  {line}
                  {i < address.length - 1 && <br />}
                </span>
              ))}
            </address>
          </div>
        )}
      </div>
    </div>
  );
}
