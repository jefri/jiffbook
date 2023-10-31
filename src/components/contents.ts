import { li, nav, ol, ul } from "../dom.js";
import { sectionBreadcrumbs } from "../sections.js";
import { Book, Section } from "../types.js";
import {
  SectionLink,
  SectionNextLink,
  SectionPreviousLink,
} from "./sections.js";
import { A } from "./util.js";

export type LinkMode = "hash" | "relative" | "absolute";

export function TableOfContents(
  {
    links = "absolute",
  }: {
    links?: LinkMode;
  },
  book: Book
): string {
  return TableOfContentsList(
    {
      depth: book.tocDepth,
      links,
    },
    ...book.chapters
  );
}

export function TableOfContentsList(
  {
    depth = 999,
    links = "absolute",
  }: {
    depth?: number;
    links?: LinkMode;
  },

  ...sections: Section[]
): string {
  if (sections.length === 0) return "";
  if (sectionBreadcrumbs(sections[0]).length > depth) return "";
  return ul(...sections.map((s) => TableOfContentsEntry({ links, depth }, s)));
}

export function TableOfContentsEntry(
  {
    depth = 999,
    links = "absolute",
  }: {
    depth?: number;
    links?: LinkMode;
  },
  section: Section
): string {
  return li(
    SectionLink({ links }, section),
    TableOfContentsList({ depth, links }, ...section.sections)
  );
}

export function Breadcrumbs(
  {
    links = "absolute",
  }: {
    links?: LinkMode;
  },
  section: Section
): string {
  let breadcrumbs = [];
  while (section) {
    breadcrumbs.push(SectionLink({ links }, section));
    section = section.parent!;
  }
  return ol(
    { className: "breadcrumbs" },
    ...breadcrumbs.reverse().map((l) => li(l))
  );
}

export function SectionNav(section: Section, links: LinkMode): string {
  const navs = [
    SectionPreviousLink({ links }, section),
    A({ href: "/index.html" }, "Cover"),
    A({ href: "/toc.html" }, "Contents"),
    SectionNextLink({ links }, section),
  ]
    .filter((p) => p != undefined)
    .map((l) => li(l));
  return nav(ol(...navs));
}
