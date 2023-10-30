import { article, h2, header, main, nav } from "../dom.js";
import {
  isSectionContent,
  nextSection,
  previousSection,
  sectionBreadcrumbs,
  sectionId,
} from "../sections.js";
import { Section, SectionContent } from "../types.js";
import { marked } from "marked";
import { Breadcrumbs } from "./contents.js";
import { A } from "./util.js";

export function SectionMain(section: SectionContent, single: boolean): string {
  return main(
    article(
      { id: sectionId(section) },
      header(nav(Breadcrumbs(section, single), A({ href: "#" }, "Top"))),
      main(marked.parse(section?.markdown).trim())
    )
  );
}

export function SectionNextLink(
  section: Section,
  single: boolean
): string | undefined {
  let next = nextSection(section);
  if (!next) return undefined;
  return SectionLink(next, single, `Next: ${next.title}`);
}

export function SectionPreviousLink(
  section: Section,
  single: boolean
): string | undefined {
  let previous = previousSection(section);
  if (!previous) return undefined;
  return SectionLink(previous, single, `Previous: ${previous.title}`);
}

export function SectionLink(
  section: Section,
  single: boolean,
  text = section.title
): string {
  let href;
  if (single) {
    href = "#" + encodeURIComponent(sectionId(section));
  } else {
    if (isSectionContent(section)) {
      href = "/" + sectionBreadcrumbs(section).reverse().join("/") + ".html";
    } else {
      href =
        "/" + sectionBreadcrumbs(section).reverse().join("/") + "/index.html";
    }
  }
  return A({ href }, text);
}

export function SectionComponent(section: Section, single: boolean): string[] {
  if (isSectionContent(section)) {
    return [SectionMain(section, single)];
  } else {
    return [
      section.parent
        ? nav({ id: sectionId(section) }, ...Breadcrumbs(section, single))
        : h2({ id: sectionId(section) }, section.title),
      ...section.sections.map((s) => SectionComponent(s, single)).flat(),
    ];
  }
}
