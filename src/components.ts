import { marked } from "marked";
import { Book, Section, SectionContent, SectionFolder } from "./types.js";
import {
  a,
  article,
  body,
  footer,
  h1,
  h2,
  head,
  header,
  html,
  li,
  link,
  main,
  meta,
  nav,
  ol,
  p,
  script,
  ul,
} from "./dom.js";
import {
  isSectionContent,
  nextSection,
  previousSection,
  sectionBreadcrumbs,
} from "./sections.js";

export function Layout(...content: string[]): string {
  return html(
    { lang: "en" },
    head(
      meta({ charset: "utf-8" } as any),
      link({
        rel: "stylesheet",
        type: "text/css",
        href: "https://unpkg.com/@davidsouther/jiffies-css",
      }),
      script({
        src: "https://unpkg.com/@davidsouther/jiffies-css/accessibility.js",
      })
    ),
    body({ className: "container" }, ...content)
  );
}

export function Cover(book: Book): string[] {
  return [
    h1(book.cover.title),
    h2(book.cover.author),
    p(a({ href: "./toc.html" } as any, "Table of Contents")),
  ];
}

export function TableOfContents(
  book: Book,
  depth = Number.MAX_SAFE_INTEGER,
  single = false
): string {
  return TableOfContentsList(book.chapters, depth, single);
}

export function TableOfContentsList(
  sections: Section[],
  depth: number,
  single: boolean
): string {
  if (sectionBreadcrumbs(sections[0]).length > depth) return "";
  return ol(...sections.map((s) => TableOfContentsEntry(s, depth, single)));
}

export function TableOfContentsEntry(
  section: Section,
  depth: number,
  single: boolean
): string {
  return li(
    single ? SectionLink(section) : InternalSectionLink(section),
    ...((section as SectionFolder).sections
      ? TableOfContentsList((section as SectionFolder).sections, depth, single)
      : "")
  );
}

export function SectionPage(section: SectionContent): string[] {
  return [header(SectionNav(section)), SectionMain(section), footer(`©`)];
}

export function SectionMain(section: SectionContent): string {
  return article(
    { id: SectionId(section) },
    header(section.title, a({ href: "#" } as any, "Top")),
    main(marked.parse(section?.markdown).trim())
  );
}

export function SectionLink(section: Section, text = section.title): string {
  const href = "/" + sectionBreadcrumbs(section).reverse().join("/") + ".html";
  return a({ href } as any, text);
}

export function InternalSectionLink(
  section: Section,
  text = section.title
): string {
  const href = "#" + encodeURIComponent(SectionId(section));
  return a({ href } as any, text);
}

export function SectionId(section: Section): string {
  return sectionBreadcrumbs(section).reverse().join("_");
}

export function SectionNav(section: SectionContent): string {
  const links = [
    SectionPreviousLink(section),
    a({ href: "/toc.html" } as any, "Contents"),
    SectionNextLink(section),
  ]
    .filter((p) => p != undefined)
    .map((l) => li(l));
  return nav(ul(...links));
}

export function SectionNextLink(section: SectionContent): string | undefined {
  let next = nextSection(section);
  if (!next) return undefined;
  return SectionLink(next, `Next: ${next.title}`);
}

export function SectionPreviousLink(
  section: SectionContent
): string | undefined {
  let previous = previousSection(section);
  if (!previous) return undefined;
  return SectionLink(previous, `Previous: ${previous.title}`);
}

export function SectionComponent(section: Section): string[] {
  if (isSectionContent(section)) {
    return [a({ id: SectionId(section) } as any), SectionMain(section)];
  } else {
    return section.sections.map((s) => SectionComponent(s)).flat();
  }
}
