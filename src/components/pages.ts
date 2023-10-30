import {
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
  link,
  main,
  meta,
  nav,
  script,
  style,
} from "../dom.js";
import { Book, Section } from "../types.js";
import { A } from "./util.js";
import { JiffdownSettings } from "src/fs.js";
import {
  Breadcrumbs,
  TableOfContents,
  TableOfContentsList,
} from "./contents.js";
import { SectionComponent } from "./sections.js";

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
  return [Header(book), main(...contents), Footer(book)];
}

export function Header(book: Book, chapter?: Section): string {
  return header({ className: "fluid" }, nav(...Cover(book, true, chapter)));
}

export function Footer(book: Book): string {
  return footer(
    { className: "fluid" },
    nav(`©${new Date().getFullYear()} ${book.cover.author}`)
  );
}

export function Cover(book: Book, single = false, chapter?: Section): string[] {
  return chapter
    ? [
        h1(A({ href: "/" }, book.cover.title)),
        h2(A({ href: "." }, chapter.title)),
      ]
    : [
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

export function Chapter({
  book,
  chapter,
  settings,
}: {
  book: Book;
  chapter: Section;
  settings: JiffdownSettings;
}): string[] {
  return [
    Header(book, chapter),
    main(...SectionComponent(chapter, true)),
    aside(
      { id: "toc" },
      nav(...TableOfContents(book, settings.toc_depth, true))
    ),
    Footer(book),
  ];
}

export function SectionTOCPage(
  section: Section,
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

export function SectionPage(section: Section, single: boolean): string[] {
  return [
    Header(section.book),
    main(...SectionComponent(section, single)),
    Footer(section.book),
  ];
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
