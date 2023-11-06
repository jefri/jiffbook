import { useBook } from "./components/util.js";
import { Section } from "./types.js";

export function isSectionContent(section: Section): boolean {
  return section.sections.length === 0;
}

export function sectionBreadcrumbs(section: Section): string[] {
  return [
    section.slug,
    ...(section.parent ? sectionBreadcrumbs(section.parent) : []),
  ];
}

export function pathForSection(section: Section) {
  return `${section.slug}.html`;
}

export function nextSection(
  section: Section,
  previousSection?: Section
): Section | undefined {
  if (section.sections.length > 0 && !previousSection) {
    return section.sections[0];
  }

  const sections = section.parent
    ? section.parent.sections
    : useBook().chapters;

  const self = sections.indexOf(section);
  const next = sections[self + 1];
  if (next) return next;

  return section.parent ? nextSection(section.parent, section) : undefined;
}

export function previousSection(section: Section): Section | undefined {
  const sections = section.parent
    ? section.parent.sections
    : useBook().chapters;

  const self = sections.indexOf(section);
  const next = sections[self - 1];
  if (next) return lastSection(next);

  return section.parent;
}

export function lastSection(section: Section): Section {
  return section.sections.length === 0
    ? section
    : lastSection(section.sections.at(-1)!);
}

export function sectionId(section: Section): string {
  return "_" + sectionBreadcrumbs(section).reverse().join("_");
}

export type LinkMode = "hash" | "relative" | "absolute";
export function getLink({
  links,
  dest,
  src,
}: {
  links: LinkMode;
  dest: Section;
  src?: Section;
}) {
  if (links === "hash") return "#" + encodeURIComponent(sectionId(dest));
  const isDestContent = isSectionContent(dest);
  const end = isDestContent ? ".html" : "/index.html";
  const relative = [];
  const destLink = sectionBreadcrumbs(dest);
  if (links === "relative") {
    const srcLink = src ? sectionBreadcrumbs(src) : [];
    while (
      (srcLink.length > 0 || destLink.length > 0) &&
      srcLink.at(-1) === destLink.at(-1)
    ) {
      srcLink.pop();
      destLink.pop();
    }
    const relCount = srcLink.length - (src && isSectionContent(src) ? 1 : 0);
    if (relCount > 0) {
      for (let i = 0; i < relCount; i++) {
        relative.push("..");
      }
    } else {
      relative.push(".");
    }
  }
  return (
    relative.join("/") +
    "/" +
    destLink.reverse().join("/") +
    end
  ).replace("//", "/");
}
