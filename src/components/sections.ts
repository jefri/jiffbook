import {
  article,
  h1,
  h2,
  header,
  main,
  nav,
  section as sectionDOM,
} from "../dom.js";
import {
  isSectionContent,
  nextSection,
  previousSection,
  sectionBreadcrumbs,
  sectionId,
} from "../sections.js";
import { Section } from "../types.js";
import { marked } from "marked";
import { Breadcrumbs, LinkMode } from "./contents.js";
import { A } from "./util.js";

export function SectionArticle(section: Section, links: LinkMode): string {
  return article(
    { id: sectionId(section) },
    header(
      nav(
        h1(section.title),
        Breadcrumbs(section, links),
        A({ href: "#" }, "Top")
      )
    ),
    main(marked.parse(section.markdown).trim())
  );
}

export function SectionNextLink(
  section: Section,
  links: LinkMode
): string | undefined {
  let next = nextSection(section);
  if (!next) return undefined;
  return SectionLink(next, links, `Next: ${next.title}`);
}

export function SectionPreviousLink(
  section: Section,
  links: LinkMode
): string | undefined {
  let previous = previousSection(section);
  if (!previous) return undefined;
  return SectionLink(previous, links, `Previous: ${previous.title}`);
}

export function SectionLink(
  section: Section,
  links: LinkMode,
  text = section.title
): string {
  let href;
  if (links === "hash") {
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

export function SectionComponent(section: Section, links: LinkMode): string {
  if (isSectionContent(section)) {
    return SectionArticle(section, links);
  } else {
    return sectionDOM(
      header(
        section.parent
          ? nav({ id: sectionId(section) }, ...Breadcrumbs(section, links))
          : h2({ id: sectionId(section) }, section.title)
      ),
      main(marked.parse(section.markdown).trim()),
      ...section.sections.map((s) => SectionComponent(s, links))
    );
  }
}
