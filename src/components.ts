import { marked } from "marked";
import { Book, Section, SectionContent, SectionFolder } from "./types.js";
import {
  a,
  article,
  aside,
  body,
  div,
  footer,
  h1,
  h2,
  h3,
  head,
  header,
  html,
  li,
  link,
  main,
  meta,
  nav,
  ol,
  p,
  script,
  style,
  ul,
} from "./dom.js";
import {
  isSectionContent,
  nextSection,
  previousSection,
  sectionBreadcrumbs,
} from "./sections.js";
import { JiffdownSettings } from "./fs.js";

export function Layout(...content: string[]): string {
  return html(
    { lang: "en" },
    head(
      meta({ charset: "utf-8" } as any),
      link({
        rel: "stylesheet",
        type: "text/css",
        href: "https://unpkg.com/@davidsouther/jiffies-css",
      }),
      style(singleStyle)
    ),
    body(
      ...content,
      script({
        src: "https://unpkg.com/@davidsouther/jiffies-css/accessibility.js",
      })
    )
  );
}

export function Page(book: Book, ...contents: string[]): string[] {
  return [Header(book), ...contents, Footer(book)];
}

export function Cover(book: Book, single = false): string[] {
  return [
    h1(A({ href: "/" }, book.cover.title)),
    ...(book.cover.subtitle ? [] : h2(book.cover.subtitle)),
    h3("By ", book.cover.author),
    ...(single
      ? []
      : [
          div(
            A({ href: "./toc.html" }, "Table of Contents"),
            " ",
            A({ href: "./single.html" }, "Single Page")
          ),
        ]),
  ];
}

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

export function SectionPage(
  section: SectionContent,
  single: boolean
): string[] {
  return Page(section.book, SectionMain(section, single));
}

export function SectionMain(section: SectionContent, single: boolean): string {
  return main(
    article(
      { id: SectionId(section) },
      header(nav(Breadcrumbs(section, single), A({ href: "#" }, "Top"))),
      main(marked.parse(section?.markdown).trim())
    )
  );
}

export function SectionTOCPage(
  section: SectionFolder,
  depth: number = Number.MAX_SAFE_INTEGER,
  single: boolean
): string[] {
  return Page(
    section.book,
    main(
      Breadcrumbs(section, single),
      div(
        { className: "table-of-contents" },
        TableOfContentsList(section.sections, depth, single)
      )
    )
  );
}

function Breadcrumbs(section: Section, single: boolean): string {
  let links = [];
  while (section) {
    links.push(SectionLink(section, single));
    section = section.parent!;
  }
  return ol({ className: "breadcrumbs" }, ...links.reverse().map((l) => li(l)));
}

export function SectionLink(
  section: Section,
  single: boolean,
  text = section.title
): string {
  let href;
  if (single) {
    href = "#" + encodeURIComponent(SectionId(section));
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

export function SectionId(section: Section): string {
  return sectionBreadcrumbs(section).reverse().join("_");
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

export function SectionComponent(section: Section, single: boolean): string[] {
  if (isSectionContent(section)) {
    return [SectionMain(section, single)];
  } else {
    return [
      section.parent
        ? nav({ id: SectionId(section) }, ...Breadcrumbs(section, single))
        : h2({ id: SectionId(section) }, section.title),
      ...section.sections.map((s) => SectionComponent(s, single)).flat(),
    ];
  }
}

export function A({ href }: { href: string }, title: string): string {
  return a({ href } as any, title);
}

export function Single({
  book,
  settings,
}: {
  book: Book;
  settings: JiffdownSettings;
}): string[] {
  return [
    Header(book),
    main(...book.chapters.map((s) => SectionComponent(s, true)).flat()),
    aside(
      { id: "toc" },
      nav(...TableOfContents(book, settings.toc_depth, true))
    ),
    Footer(book),
  ];
}

export function Header(book: Book): string {
  return header({ className: "fluid" }, nav(...Cover(book, true)));
}

export function Footer(book: Book): string {
  return footer(
    { className: "fluid" },
    nav(`©${new Date().getFullYear()} ${book.cover.author}`)
  );
}

const singleStyle = `
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Orbitron:wght@400;700&family=Poppins:ital,wght@0,400;0,700;1,400;1,700&display=swap');

:root {
  --font-family-base: Poppins;
  --font-family-header: Orbitron;
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

body > main {
  flex-grow: 1;
  width: 100%;
}

.cover {
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}

.table-of-contents {
  columns: 2;
}

@media (prefers-color-scheme: dark) {
  a, [role=link] {
    --text-color: #BBBBFF;
  }
}

nav .breadcrumbs li {
  display: inline-block;
  margin-left: 1em;
}

nav .breadcrumbs li::marker {
  content: '→';
}

:is(body,#body,#root)>aside:has(>nav) {
  width: min-content;
}

:is(body,#body,#root)>aside>nav {
  max-height: 90vh;
  overscroll-behavior: contain;
  overflow: scroll;
}

aside nav ul li a {
  white-space: nowrap;
}
`;
