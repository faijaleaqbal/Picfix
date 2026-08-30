import Link from "next/link";
import { cn } from "@/lib/utils";
import { getTool, type ToolMeta } from "@/lib/tools";

/**
 * Shared "Related Tools" grid. Appears on the landing-family pages
 * (compress, crop, watermark). Renders the canonical card: icon chip,
 * name, one-liner — the whole card links to the tool route.
 */
export function RelatedTools({
  slugs,
  title = "Related Tools",
  columns = 4,
  className,
}: {
  slugs: string[];
  title?: string;
  columns?: 3 | 4;
  className?: string;
}) {
  const tools = slugs
    .map((slug) => getTool(slug))
    .filter((tool): tool is ToolMeta => Boolean(tool));

  return (
    <section className={cn("border-t border-border py-stack-lg", className)}>
      <h3 className="font-headline-md text-headline-md text-primary mb-stack-md">
        {title}
      </h3>
      <div
        className={cn(
          "grid grid-cols-1 gap-stack-md",
          columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"
        )}
      >
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/${tool.slug}`}
            className="group flex flex-col items-start gap-stack-sm rounded-xl border border-border bg-surface p-stack-md transition-colors hover:border-accent-lavender"
          >
            <div className="rounded-lg bg-surface-container-high p-2 text-primary transition-colors group-hover:text-accent-lavender">
              <tool.icon className="size-5" />
            </div>
            <h4 className="font-label-md text-label-md text-primary">
              {tool.title}
            </h4>
            <p className="font-body-md text-body-md text-sm text-text-secondary">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
