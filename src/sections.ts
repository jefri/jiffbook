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
