import { li, nav, ol, ul } from "../dom.js";
import { sectionBreadcrumbs } from "../sections.js";
import { Book, Section, SectionFolder } from "../types.js";
import {
  SectionLink,
  SectionNextLink,
  SectionPreviousLink,
} from "./sections.js";
import { A } from "./util.js";

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

export function Breadcrumbs(section: Section, single: boolean): string {
  let links = [];
  while (section) {
    links.push(SectionLink(section, single));
    section = section.parent!;
  }
  return ol({ className: "breadcrumbs" }, ...links.reverse().map((l) => li(l)));
}

export function SectionNav(section: Section, single: boolean): string {
  const links = [
    SectionPreviousLink(section, single),
    A({ href: "/index.html" }, "Cover"),
    A({ href: "/toc.html" }, "Contents"),
    SectionNextLink(section, single),
  ]
    .filter((p) => p != undefined)
    .map((l) => li(l));
  return nav(ul(...links));
}
