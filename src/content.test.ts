import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { load, markSectionParents, slugToName, write } from "./content.js";
import { test, expect } from "vitest";
import { Book } from "./types.js";
import { GitAwareFs } from "./fs.js";

test("load cover", async () => {
  const fs = new FileSystem(
    new ObjectFileSystemAdapter({
      ".jiffbookrc": `title: Medina-99\ncover: ./cover.png\nauthor: David Souther\n`,
    })
  );

  const book = await load(fs);

  expect(book).toEqual<Book>({
    cover: {
      title: "Medina-99",
      image: { source: "./cover.png", dest: "./cover.png" },
      author: "David Souther",
    },
    chapters: [],
  });
});

test.each([
  ["02_title", "Title"],
  ["04_foo_bar_baz", "Foo Bar Baz"],
])("parse slug %s to name %s", (slug, name) => {
  let parsed = slugToName(slug);
  expect(parsed).toBe(name);
});

test("load chapters", async () => {
  const fs = new FileSystem(
    new ObjectFileSystemAdapter({
      ".jiffbookrc": `title: Medina-99\nauthor: David Souther\n`,
      "01_intro": {
        "01_hello.md": "Hello",
        "02_foo.md": "foo",
        "03_bar.md": "bar",
      },
      "02_part_2": {
        ".jiffbookrc": "title: Second Part",
        "01_hello.md": "World",
        "02_foo_bar_baz.md": "---\ntitle: Quick Brown\n---\nThe foxy fox",
      },
    })
  );

  const book = await load(fs);
  const expected = {
    cover: {
      title: "Medina-99",
      author: "David Souther",
    },
    chapters: [
      {
        slug: "01_intro",
        title: "Intro",
        sections: [
          {
            slug: "01_hello",
            title: "Hello",
            markdown: "Hello",
          },
          {
            slug: "02_foo",
            title: "Foo",
            markdown: "foo",
          },
          {
            slug: "03_bar",
            title: "Bar",
            markdown: "bar",
          },
        ],
      },
      {
        slug: "02_part_2",
        title: "Second Part",
        sections: [
          {
            slug: "01_hello",
            title: "Hello",
            markdown: "World",
          },
          {
            slug: "02_foo_bar_baz",
            title: "Quick Brown",
            markdown: "The foxy fox",
          },
        ],
      },
    ],
  };

  (expected.chapters[0].sections[0] as any).parent = expected.chapters[0];
  (expected.chapters[0].sections[1] as any).parent = expected.chapters[0];
  (expected.chapters[0].sections[2] as any).parent = expected.chapters[0];
  (expected.chapters[1].sections[0] as any).parent = expected.chapters[1];
  (expected.chapters[1].sections[1] as any).parent = expected.chapters[1];

  expect(book).toEqual<Book>(expected);
});

test("writes content", async () => {
  const book: Book = {
    cover: {
      title: "Medina-99",
      author: "David Souther",
    },
    chapters: [
      {
        slug: "01_intro",
        title: "Intro",
        sections: [
          {
            slug: "01_hello",
            title: "Hello",
            markdown: "Hello",
          },
          {
            slug: "02_foo",
            title: "Foo",
            markdown: "foo",
          },
          {
            slug: "03_bar",
            title: "Bar",
            markdown: "bar",
          },
        ],
      },
      {
        slug: "02_part_2",
        title: "Second Part",
        sections: [
          {
            slug: "01_hello",
            title: "Hello",
            markdown: "World",
          },
          {
            slug: "02_foo_bar_baz",
            title: "Quick Brown",
            markdown: "The foxy fox",
          },
        ],
      },
    ],
  };
  for (const chapter of book.chapters) {
    markSectionParents(chapter);
  }

  const fs = new FileSystem(new ObjectFileSystemAdapter({}));

  await write({ fs, settings: { out: "book" }, book });

  const actual = (fs as any).adapter.fs;
  console.log(JSON.stringify(actual));

  expect(actual).toEqual({
    "/book/index.html":
      '<!doctype html><html lang="en"><head><link rel="stylesheet" type="text/css" href="https://unpkg.com/@davidsouther/jiffies-css"></link><script src="https://unpkg.com/@davidsouther/jiffies-css/accessibility.js"></script></head><body class="container"><h1>Medina-99</h1><h2>David Souther</h2><p><a href="./toc.html">Table of Contents</a></p></body></html>',
    "/book/toc.html":
      '<!doctype html><html lang="en"><head><link rel="stylesheet" type="text/css" href="https://unpkg.com/@davidsouther/jiffies-css"></link><script src="https://unpkg.com/@davidsouther/jiffies-css/accessibility.js"></script></head><body class="container"><ol><li><a href="/01_intro.html">Intro</a><ol><li><a href="/01_intro/01_hello.html">Hello</a></li><li><a href="/01_intro/02_foo.html">Foo</a></li><li><a href="/01_intro/03_bar.html">Bar</a></li></ol></li><li><a href="/02_part_2.html">Second Part</a><ol><li><a href="/02_part_2/01_hello.html">Hello</a></li><li><a href="/02_part_2/02_foo_bar_baz.html">Quick Brown</a></li></ol></li></ol></body></html>',
    "/book/01_intro/01_hello.html":
      '<!doctype html><html lang="en"><head><link rel="stylesheet" type="text/css" href="https://unpkg.com/@davidsouther/jiffies-css"></link><script src="https://unpkg.com/@davidsouther/jiffies-css/accessibility.js"></script></head><body class="container"><header><nav><ul><li><a href="/toc.html">Contents</a></li><li><a href="/01_intro/02_foo.html">Next: Foo</a></li></ul></nav></header><main><p>Hello</p></main><footer>©</footer></body></html>',
    "/book/01_intro/02_foo.html":
      '<!doctype html><html lang="en"><head><link rel="stylesheet" type="text/css" href="https://unpkg.com/@davidsouther/jiffies-css"></link><script src="https://unpkg.com/@davidsouther/jiffies-css/accessibility.js"></script></head><body class="container"><header><nav><ul><li><a href="/01_intro/01_hello.html">Previous: Hello</a></li><li><a href="/toc.html">Contents</a></li><li><a href="/01_intro/03_bar.html">Next: Bar</a></li></ul></nav></header><main><p>foo</p></main><footer>©</footer></body></html>',
    "/book/01_intro/03_bar.html":
      '<!doctype html><html lang="en"><head><link rel="stylesheet" type="text/css" href="https://unpkg.com/@davidsouther/jiffies-css"></link><script src="https://unpkg.com/@davidsouther/jiffies-css/accessibility.js"></script></head><body class="container"><header><nav><ul><li><a href="/01_intro/02_foo.html">Previous: Foo</a></li><li><a href="/toc.html">Contents</a></li></ul></nav></header><main><p>bar</p></main><footer>©</footer></body></html>',
    "/book/02_part_2/01_hello.html":
      '<!doctype html><html lang="en"><head><link rel="stylesheet" type="text/css" href="https://unpkg.com/@davidsouther/jiffies-css"></link><script src="https://unpkg.com/@davidsouther/jiffies-css/accessibility.js"></script></head><body class="container"><header><nav><ul><li><a href="/toc.html">Contents</a></li><li><a href="/02_part_2/02_foo_bar_baz.html">Next: Quick Brown</a></li></ul></nav></header><main><p>World</p></main><footer>©</footer></body></html>',
    "/book/02_part_2/02_foo_bar_baz.html":
      '<!doctype html><html lang="en"><head><link rel="stylesheet" type="text/css" href="https://unpkg.com/@davidsouther/jiffies-css"></link><script src="https://unpkg.com/@davidsouther/jiffies-css/accessibility.js"></script></head><body class="container"><header><nav><ul><li><a href="/02_part_2/01_hello.html">Previous: Hello</a></li><li><a href="/toc.html">Contents</a></li></ul></nav></header><main><p>The foxy fox</p></main><footer>©</footer></body></html>',
  });
});

test("load chapters ignores .git, .gitignore, and out", async () => {
  const fs = new GitAwareFs(
    new ObjectFileSystemAdapter({
      ".git": {
        config: "author",
      },
      ".gitignore": "dir",
      ".jiffbookrc": `title: Medina-99\nauthor: David Souther\n`,
      "01_intro": {
        "01_hello.md": "Hello",
      },
      dir: {
        ".jiffbookrc": "title: Second Part",
        "01_hello.md": "World",
      },
    })
  );

  const book = await load(fs);
  const expected = {
    cover: {
      title: "Medina-99",
      author: "David Souther",
    },
    chapters: [
      {
        slug: "01_intro",
        title: "Intro",
        parent: undefined,
        sections: [
          {
            slug: "01_hello",
            title: "Hello",
            markdown: "Hello",
          },
        ],
      },
    ],
  };
  (expected.chapters[0].sections[0] as any).parent = expected.chapters[0];

  expect(book).toEqual<Book>(expected);
});
