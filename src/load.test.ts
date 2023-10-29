import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { load, slugToName } from "./load.js";
import { test, expect } from "vitest";
import { Book } from "./types.js";
import { GitAwareFs, JiffdownSettings } from "./fs.js";

test("load cover", async () => {
  const fs = new FileSystem(
    new ObjectFileSystemAdapter({
      ".jiffbookrc": `title: Medina-99\ncover: ./cover.png\nauthor: David Souther\n`,
    })
  );

  const book = await load(fs, {} as JiffdownSettings);

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

  const book = await load(fs, {} as JiffdownSettings);
  const expected = {
    cover: {
      title: "Medina-99",
      author: "David Souther",
    },
    chapters: [
      {
        slug: "01_intro",
        title: "Intro",
        book: {} as Book,
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
      },
      {
        slug: "02_part_2",
        title: "Second Part",
        book: {} as Book,
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

  (expected.chapters[0].sections[0] as any).parent = expected.chapters[0];
  (expected.chapters[0].sections[1] as any).parent = expected.chapters[0];
  (expected.chapters[0].sections[2] as any).parent = expected.chapters[0];
  (expected.chapters[1].sections[0] as any).parent = expected.chapters[1];
  (expected.chapters[1].sections[1] as any).parent = expected.chapters[1];

  expect(book).toEqual<Book>(expected);
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

  const book = await load(fs, {} as JiffdownSettings);
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
        book: {} as Book,
        sections: [
          {
            slug: "01_hello",
            title: "Hello",
            markdown: "Hello",
            book: {} as Book,
          },
        ],
      },
    ],
  };
  (expected.chapters[0].sections[0] as any).parent = expected.chapters[0];
  expected.chapters[0].book = expected;
  (expected.chapters[0].sections[0] as any).book = expected;

  expect(book).toEqual<Book>(expected);
});

test("load chapters ignores skip", async () => {
  const fs = new GitAwareFs(
    new ObjectFileSystemAdapter({
      ".jiffbookrc": `title: Medina-99\nauthor: David Souther\n`,
      "01_intro": {
        ".jiffbookrc": "skip: true",
        "01_hello.md": "Hello",
      },
      "02_other": {
        "02_skip.md": "---\nskip: true\n---\n",
      },
    })
  );

  const book = await load(fs, {} as JiffdownSettings);
  const expected = {
    cover: {
      title: "Medina-99",
      author: "David Souther",
    },
    chapters: [
      {
        slug: "02_other",
        title: "Other",
        parent: undefined,
        sections: [],
        book: {} as Book,
      },
    ],
  };
  expected.chapters[0].book = expected;

  expect(book).toEqual<Book>(expected);
});
