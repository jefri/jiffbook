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
    body(...content)
  );
}

export function Cover(book: Book, single = false): string[] {
  return [
    h1(book.cover.title),
    h2(book.cover.author),
    p(a({ href: single ? "#toc" : "./toc.html" } as any, "Table of Contents")),
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
  return ul(...sections.map((s) => TableOfContentsEntry(s, depth, single)));
}

export function TableOfContentsEntry(
  section: Section,
  depth: number,
  single: boolean
): string {
  return li(
    SectionLink(section, single),
    ...((section as SectionFolder).sections
      ? TableOfContentsList((section as SectionFolder).sections, depth, single)
      : "")
  );
}

export function SectionPage(
  section: SectionContent,
  single: boolean
): string[] {
  return [
    header(SectionNav(section, single)),
    SectionMain(section, single),
    footer(`©`),
  ];
}

export function SectionMain(section: SectionContent, single: boolean): string {
  return article(
    { id: SectionId(section) },
    header(nav(Breadcrumbs(section, single), a({ href: "#" } as any, "Top"))),
    main(marked.parse(section?.markdown).trim())
  );
}

function Breadcrumbs(section: Section, single: boolean): string {
  let links = [];
  while (section) {
    links.push(SectionLink(section, single));
    section = section.parent!;
  }
  return ol({ className: "breadcrumbs" }, ...links.reverse().map((l) => li(l)));
}

export function SectionLink(
  section: Section,
  single: boolean,
  text = section.title
): string {
  const href = single
    ? "#" + encodeURIComponent(SectionId(section))
    : "/" + sectionBreadcrumbs(section).reverse().join("/") + ".html";
  return a({ href } as any, text);
}

export function SectionId(section: Section): string {
  return sectionBreadcrumbs(section).reverse().join("_");
}

export function SectionNav(section: SectionContent, single: boolean): string {
  const links = [
    SectionPreviousLink(section, single),
    a({ href: "/toc.html" } as any, "Contents"),
    SectionNextLink(section, single),
  ]
    .filter((p) => p != undefined)
    .map((l) => li(l));
  return nav(ul(...links));
}

export function SectionNextLink(
  section: SectionContent,
  single: boolean
): string | undefined {
  let next = nextSection(section);
  if (!next) return undefined;
  return SectionLink(next, single, `Next: ${next.title}`);
}

export function SectionPreviousLink(
  section: SectionContent,
  single: boolean
): string | undefined {
  let previous = previousSection(section);
  if (!previous) return undefined;
  return SectionLink(previous, single, `Previous: ${previous.title}`);
}

export function SectionComponent(section: Section, single: boolean): string[] {
  if (isSectionContent(section)) {
    return [SectionMain(section, single)];
  } else {
    return [
      section.parent
        ? nav({ id: SectionId(section) }, ...Breadcrumbs(section, single))
        : h2({ id: SectionId(section) }, section.title),
      ...section.sections.map((s) => SectionComponent(s, single)).flat(),
    ];
  }
}
