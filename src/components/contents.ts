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
  book: Book,
  depth = Number.MAX_SAFE_INTEGER,
  links: LinkMode
): string {
  return TableOfContentsList(book.chapters, depth, links);
}

export function TableOfContentsList(
  sections: Section[],
  depth: number,
  links: LinkMode
): string {
  if (sections.length === 0) return "";
  if (sectionBreadcrumbs(sections[0]).length > depth) return "";
  return ul(...sections.map((s) => TableOfContentsEntry(s, depth, links)));
}

export function TableOfContentsEntry(
  section: Section,
  depth: number,
  links: LinkMode
): string {
  return li(
    SectionLink(section, links),
    TableOfContentsList(section.sections, depth, links)
  );
}

export function Breadcrumbs(section: Section, links: LinkMode): string {
  let breadcrumbs = [];
  while (section) {
    breadcrumbs.push(SectionLink(section, links));
    section = section.parent!;
  }
  return ol(
    { className: "breadcrumbs" },
    ...breadcrumbs.reverse().map((l) => li(l))
  );
}

export function SectionNav(section: Section, links: LinkMode): string {
  const navs = [
    SectionPreviousLink(section, links),
    A({ href: "/index.html" }, "Cover"),
    A({ href: "/toc.html" }, "Contents"),
    SectionNextLink(section, links),
  ]
    .filter((p) => p != undefined)
    .map((l) => li(l));
  return nav(ol(...navs));
}
