import { marked } from "marked";
import { Book, Section, SectionContent, SectionFolder } from "./types.js";
import {
  a,
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
export function TableOfContents(book: Book): string {
  return TableOfContentsList(book.chapters);
}
export function TableOfContentsList(sections: Section[]): string {
  return ol(...sections.map(TableOfContentsEntry));
}
export function TableOfContentsEntry(section: Section): string {
  return li(
    SectionLink(section),
    ...((section as SectionFolder).sections
      ? TableOfContentsList((section as SectionFolder).sections)
      : "")
  );
}

export function Section(section: SectionContent): string[] {
  return [
    header(SectionNav(section)),
    main(marked.parse(section?.markdown).trim()),
    footer(`©`),
  ];
}

export function SectionLink(section: Section, text = section.title): string {
  const href = "/" + sectionBreadcrumbs(section).reverse().join("/") + ".html";
  return a({ href } as any, text);
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
