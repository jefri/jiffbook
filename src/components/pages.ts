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
} from "../dom.js";
import { Book, Section } from "../types.js";
import { A, C, useBook } from "./util.js";
import {
  Breadcrumbs,
  TableOfContents,
  TableOfContentsList,
} from "./contents.js";
import { SectionComponent } from "./sections.js";
import { LinkMode, sectionBreadcrumbs } from "../sections.js";

export function Layout(...content: string[]): string {
  const book = useBook();
  return html(
    { lang: "en" },
    head(
      meta({ charset: "utf-8" } as any),
      ...(book.styles ?? []).map((href) => link({ href, rel: "stylesheet" }))
    ),
    body(
      ...content,
      ...(book.scripts ?? []).map((href) => link({ href, rel: "stylesheet" }))
    )
  );
}

export function Page(
  attributes: { className?: string; depth?: number } | string,
  ...contents: string[]
): string[] {
  if (typeof attributes == "string") {
    contents.unshift(attributes);
    attributes = {};
  }
  return [
    C("General Page"),
    Header({ depth: attributes.depth }),
    main({ className: attributes.className }, ...contents),
    Footer(),
  ];
}

export function Header({
  depth,
  chapter,
}: {
  depth?: number;
  chapter?: Section;
}): string {
  return header(
    { className: "fluid" },
    nav(...Cover({ single: true, depth }, chapter))
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
  { single = false, depth = 0 }: { single?: boolean; depth?: number } = {},
  chapter?: Section
): string[] {
  const book = useBook();
  return chapter
    ? [
        C("Chapter Cover"),
        h1(A({ href: "../" }, book.cover.title)),
        h2(A({ href: "." }, chapter.title)),
      ]
    : [
        C("Book Cover"),
        h1(
          A(
            {
              href: depth === 0 ? "./" : new Array(depth).fill("..").join("/"),
            },
            book.cover.title
          )
        ),
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
    C("Book Single Page"),
    Header({ depth: 0 }),
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
    C("Chapter Page"),
    Header({ depth: 1, chapter }),
    main(...SectionComponent({ links: "hash" }, chapter)),
    aside({ id: "toc" }, nav(...TableOfContents({ links: "hash" }, book))),
    Footer(),
  ];
}

export function SectionTOCPage(
  { links = "absolute" }: { links?: LinkMode },
  section: Section
): string[] {
  return Page(
    {
      className: "table-of-contents",
      depth: sectionBreadcrumbs(section).length,
    },
    C("Section TOC Page"),
    main(
      Breadcrumbs({ links }, section),
      div(
        { className: "table-of-contents" },
        TableOfContentsList({ links, src: section }, ...section.sections)
      )
    )
  );
}

export function SectionPage(
  { links = "absolute" }: { links?: LinkMode },
  section: Section
): string[] {
  return Page(
    { depth: sectionBreadcrumbs(section).length - 1 },
    C("Section Page"),
    SectionComponent({ links }, section)
  );
}
