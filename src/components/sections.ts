import {
  article,
  footer,
  h1,
  h2,
  header,
  li,
  main,
  nav,
  ol,
  section as sectionDOM,
} from "../dom.js";
import {
  LinkMode,
  getLink,
  isSectionContent,
  nextSection,
  previousSection,
  sectionId,
} from "../sections.js";
import { Section, isDefined } from "../types.js";
import { marked } from "marked";
import { Breadcrumbs } from "./contents.js";
import { A } from "./util.js";

export function SectionArticle({
  section,
  links,
}: {
  section: Section;
  links: LinkMode;
}): string {
  return article(
    { id: sectionId(section) },
    header(
      nav(
        h1(section.title),
        Breadcrumbs({ links }, section),
        A({ href: "#" }, "Top")
      )
    ),
    main(marked.parse(section.markdown).trim()),
    footer(SectionNav({}, section))
  );
}

export function SectionNextLink(
  { links = "absolute", src }: { links?: LinkMode; src?: Section },
  section: Section
): string | undefined {
  let next = nextSection(section);
  if (!next) return undefined;
  return SectionLink({ links, src }, next, `Next: ${next.title}`);
}

export function SectionPreviousLink(
  { links = "absolute", src }: { links?: LinkMode; src?: Section },
  section: Section
): string | undefined {
  let previous = previousSection(section);
  if (!previous) return undefined;
  return SectionLink({ links, src }, previous, `Previous: ${previous.title}`);
}

export function SectionLink(
  { links, src }: { links: LinkMode; src?: Section },
  section: Section,
  text = section.title
): string {
  const href = getLink({ links, dest: section, src });
  return A({ href }, text);
}

export function SectionNav(
  { src }: { src?: Section },
  section: Section
): string {
  const prev = SectionPreviousLink(
    { links: "relative", src: src ?? section },
    section
  );
  const next = SectionNextLink(
    { links: "relative", src: src ?? section },
    section
  );
  return prev || next
    ? nav(ol(...[prev, next].filter(isDefined).map((n) => li(n))))
    : "";
}

export function SectionComponent(
  { links = "absolute", src }: { links?: LinkMode; src?: Section },
  section: Section
): string {
  if (isSectionContent(section)) {
    return SectionArticle({ section, links });
  } else {
    return sectionDOM(
      header(
        section.parent
          ? nav(
              { id: sectionId(section) },
              ...Breadcrumbs(
                { links: "relative", src: src ?? section },
                section
              )
            )
          : h2({ id: sectionId(section) }, section.title)
      ),
      main(marked.parse(section.markdown).trim()),
      ...section.sections.map((s) =>
        SectionComponent({ links, src: src ?? section }, s)
      ),
      footer(...SectionNav({ src: src ?? section }, section))
    );
  }
}
