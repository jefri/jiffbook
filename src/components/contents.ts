import { li, nav, ol } from "../dom.js";
import { LinkMode, sectionBreadcrumbs } from "../sections.js";
import { Book, Section } from "../types.js";
import {
  SectionLink,
  SectionNextLink,
  SectionPreviousLink,
} from "./sections.js";
import { A, C, useBook } from "./util.js";

export function TableOfContents(
  { links = "absolute" }: { links?: LinkMode },
  book: Book
): string {
  return (
    C("Table of Contents") + TableOfContentsList({ links }, ...book.chapters)
  );
}

export function TableOfContentsList(
  { links = "absolute", src }: { links?: LinkMode; src?: Section },
  ...sections: Section[]
): string {
  if (sections.length === 0) return "";
  if (sectionBreadcrumbs(sections[0]).length > useBook().tocDepth) return "";
  return (
    C("TOContents List") +
    ol(...sections.map((s) => TableOfContentsEntry({ links, src }, s)))
  );
}

export function TableOfContentsEntry(
  { links = "absolute", src }: { links?: LinkMode; src?: Section },
  section: Section
): string {
  return (
    C("TOC Entry") +
    li(
      SectionLink({ links, src }, section),
      TableOfContentsList({ links, src }, ...section.sections)
    )
  );
}

export function Breadcrumbs(
  { links = "absolute", src }: { links?: LinkMode; src?: Section },
  section: Section
): string {
  let breadcrumbs = [];
  while (section) {
    breadcrumbs.push(SectionLink({ links, src }, section));
    section = section.parent!;
  }
  return (
    C("Breadcrumbs") +
    ol({ className: "breadcrumbs" }, ...breadcrumbs.reverse().map((l) => li(l)))
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
  return C("Section Nav") + nav(ol(...navs));
}
