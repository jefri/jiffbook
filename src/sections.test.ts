import { beforeEach, expect, test } from "vitest";
import { Book } from "./types.js";
import { getLink, nextSection, previousSection } from "./sections.js";
import { markSectionParents } from "./load.js";
import { setBook } from "./components/util.js";

const book: Book = {
  cover: {
    author: "Test Author",
    title: "Test Book",
  },
  tocDepth: 3,
  chapters: [
    {
      id: "10_a",
      slug: "a",
      title: "A",
      markdown: "a",
      sections: [
        {
          id: "11_a_a",
          slug: "a_a",
          title: "AA",
          markdown: "aa",
          sections: [],
        },
        {
          id: "12_a_b",
          slug: "a_b",
          title: "AB",
          markdown: "ab",
          sections: [],
        },
      ],
    },
    {
      id: "20_b",
      slug: "b",
      title: "B",
      markdown: "b",
      sections: [
        {
          id: "21_b_a",
          slug: "b_a",
          title: "~A",
          markdown: "ba",
          sections: [],
        },
        {
          id: "22_b_b",
          slug: "b_b",
          title: "BB",
          markdown: "bb",
          sections: [],
        },
      ],
    },
  ],
};
book.chapters.forEach((s) => markSectionParents(s));

beforeEach(() => {
  setBook(book);
});

test.each([
  [book.chapters[0], book.chapters[0].sections[0]],
  [book.chapters[0].sections[0], book.chapters[0].sections[1]],
  [book.chapters[0].sections[1], book.chapters[1]],
  [book.chapters[1], book.chapters[1].sections[0]],
  [book.chapters[1].sections[0], book.chapters[1].sections[1]],
  [book.chapters[1].sections[1], undefined],
])("section next links", (section, expected) => {
  const actual = nextSection(section);
  expect(actual).toBe(expected);
});

test.each([
  [book.chapters[0], undefined],
  [book.chapters[0].sections[0], book.chapters[0]],
  [book.chapters[0].sections[1], book.chapters[0].sections[0]],
  [book.chapters[1], book.chapters[0].sections[1]],
  [book.chapters[1].sections[0], book.chapters[1]],
  [book.chapters[1].sections[1], book.chapters[1].sections[0]],
])("section previous links", (section, expected) => {
  const actual = previousSection(section);
  expect(actual).toBe(expected);
});

test.each([
  { dest: book.chapters[0], src: undefined, href: "./a/index.html" },
  { dest: book.chapters[0].sections[0], src: undefined, href: "./a/a_a.html" },
  {
    dest: book.chapters[0],
    src: book.chapters[0].sections[0],
    href: "./index.html",
  },
  {
    dest: book.chapters[0].sections[0],
    src: book.chapters[0],
    href: "./a_a.html",
  },
  {
    dest: book.chapters[0].sections[0],
    src: book.chapters[0].sections[1],
    href: "./a_a.html",
  },
  {
    dest: book.chapters[0].sections[1],
    src: book.chapters[0].sections[0],
    href: "./a_b.html",
  },
  {
    dest: book.chapters[1],
    src: book.chapters[0].sections[0],
    href: "../b/index.html",
  },
  {
    dest: book.chapters[1].sections[0],
    src: book.chapters[0].sections[1],
    href: "../b/b_a.html",
  },
])("section relative links $href", ({ dest, src, href }) => {
  const actual = getLink({ links: "relative", dest, src });
  expect(actual).toBe(href);
});
