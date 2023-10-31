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
import { A, useBook } from "./util.js";
import {
  Breadcrumbs,
  LinkMode,
  TableOfContents,
  TableOfContentsList,
} from "./contents.js";
import { SectionComponent } from "./sections.js";
import { singleStyle } from "./style.js";

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

export function Page(...contents: string[]): string[] {
  return [Header(), main(...contents), Footer()];
}

export function Header(chapter?: Section): string {
  const book = useBook();
  return header(
    { className: "fluid" },
    nav(...Cover({ single: true }, book, chapter))
  );
}

export function Footer(): string {
  const book = useBook();
  return footer(
    { className: "fluid" },
    nav(`©${new Date().getFullYear()} ${book.cover.author}`)
  );
}

export function Cover(
  { single = false }: { single?: boolean },
  book: Book,
  chapter?: Section
): string[] {
  return chapter
    ? [
        "<!-- Cover -->",
        h1(A({ href: "/" }, book.cover.title)),
        h2(A({ href: "." }, chapter.title)),
      ]
    : [
        "<!-- Cover -->",
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

export function Single({ book }: { book: Book }): string[] {
  return [
    Header(),
    main(
      ...book.chapters.map((s) => SectionComponent({ links: "hash" }, s)).flat()
    ),
    aside({ id: "toc" }, nav(...TableOfContents({ links: "hash" }, book))),
    Footer(),
  ];
}

export function Chapter({
  book,
  chapter,
}: {
  book: Book;
  chapter: Section;
}): string[] {
  return [
    Header(chapter),
    main(...SectionComponent({ links: "hash" }, chapter)),
    aside({ id: "toc" }, nav(...TableOfContents({ links: "hash" }, book))),
    Footer(),
  ];
}

export function SectionTOCPage(
  {
    depth = Number.MAX_SAFE_INTEGER,
    links = "absolute",
  }: {
    depth?: number;
    links?: LinkMode;
  },
  section: Section
): string[] {
  return Page(
    main(
      Breadcrumbs({ links }, section),
      div(
        { className: "table-of-contents" },
        TableOfContentsList({ depth, links }, ...section.sections)
      )
    )
  );
}

export function SectionPage(
  {
    links = "absolute",
  }: {
    links?: LinkMode;
  },
  section: Section
): string[] {
  return [Header(), main(SectionComponent({ links }, section)), Footer()];
}
