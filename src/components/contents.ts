import { li, nav, ol, ul } from "../dom.js";
import { sectionBreadcrumbs } from "../sections.js";
import { Book, Section } from "../types.js";
import {
  SectionLink,
  SectionNextLink,
  SectionPreviousLink,
} from "./sections.js";
import { A, useBook } from "./util.js";

export type LinkMode = "hash" | "relative" | "absolute";

export function TableOfContents(
  { links = "absolute" }: { links?: LinkMode },
  book: Book
): string {
  return TableOfContentsList({ links }, ...book.chapters);
}

export function TableOfContentsList(
  { links = "absolute" }: { links?: LinkMode },
  ...sections: Section[]
): string {
  if (sections.length === 0) return "";
  if (sectionBreadcrumbs(sections[0]).length > useBook().tocDepth) return "";
  return ol(...sections.map((s) => TableOfContentsEntry({ links }, s)));
}

export function TableOfContentsEntry(
  { links = "absolute" }: { links?: LinkMode },
  section: Section
): string {
  return li(
    SectionLink({ links }, section),
    TableOfContentsList({ links }, ...section.sections)
  );
}

export function Breadcrumbs(
  { links = "absolute" }: { links?: LinkMode },
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
