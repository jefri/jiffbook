import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { markSectionParents } from "./load.js";
import { test, expect } from "vitest";
import { Book } from "./types.js";
import { writeOut } from "./out.js";

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
            book: {} as Book,
          },
          {
            slug: "02_foo",
            title: "Foo",
            markdown: "foo",
            book: {} as Book,
          },
          {
            slug: "03_bar",
            title: "Bar",
            markdown: "bar",
            book: {} as Book,
          },
        ],
        book: {} as Book,
      },
      {
        book: {} as Book,
        slug: "02_part_2",
        title: "Second Part",
        sections: [
          {
            slug: "01_hello",
            title: "Hello",
            markdown: "World",
            book: {} as Book,
          },
          {
            slug: "02_foo_bar_baz",
            title: "Quick Brown",
            markdown: "The foxy fox",
            book: {} as Book,
          },
        ],
      },
    ],
  };
  for (const chapter of book.chapters) {
    markSectionParents(chapter, book);
  }

  const fs = new FileSystem(new ObjectFileSystemAdapter({}));

  await writeOut({
    fs,
    settings: { out: "book", toc_depth: Number.MAX_SAFE_INTEGER },
    book,
  });

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
