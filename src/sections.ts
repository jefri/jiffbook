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

export function nextSection(section: Section): Section | undefined {
  // No parent, no next section.
  if (!section.parent) return undefined;

  if (section === section.parent.sections.at(-1)) {
    // The section is the last in this chapter, so go to the first section of the next chapter
    return nextSection(section.parent);
  }

  const position = section.parent.sections.indexOf(section);
  return section.parent.sections[position + 1];
}

export function previousSection(section: Section): Section | undefined {
  if (!section.parent) return undefined;

  if (section === section.parent.sections.at(0)) {
    return previousSection(section.parent);
  }

  const position = section.parent.sections.indexOf(section);
  return section.parent.sections[position - 1];
}

export function sectionId(section: Section): string {
  return sectionBreadcrumbs(section).reverse().join("_");
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
  const isContent = isSectionContent(dest);
  const end = isContent ? ".html" : "/index.html";
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
    const relCount = srcLink.length + (isContent ? -1 : 0);
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
