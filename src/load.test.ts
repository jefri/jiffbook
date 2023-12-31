import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { load, slugToName } from "./load.js";
import { test, expect } from "vitest";
import { Book, Section } from "./types.js";
import { GitAwareFs, JiffbookSettings } from "./fs.js";

test("load cover", async () => {
  const fs = new FileSystem(
    new ObjectFileSystemAdapter({
      ".jiffbookrc": `title: Medina-99\ncover: ./cover.png\nauthor: David Souther\n`,
    })
  );

  const book = await load(fs, {} as JiffbookSettings);

  expect(book).toEqual<Book>({
    styles: [],
    scripts: [],
    tocDepth: 999,
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

  const book = await load(fs, {} as JiffbookSettings);
  const expected = {
    tocDepth: 999,
    styles: [],
    scripts: [],
    cover: {
      title: "Medina-99",
      author: "David Souther",
    },
    chapters: [
      {
        id: "_01_intro",
        slug: "01_intro",
        title: "Intro",
        markdown: "",
        sections: [
          {
            id: "_01_intro_01_hello",
            slug: "01_hello",
            title: "Hello",
            markdown: "Hello",
            sections: [],
          },
          {
            id: "_01_intro_02_foo",
            slug: "02_foo",
            title: "Foo",
            markdown: "foo",
            sections: [],
          },
          {
            id: "_01_intro_03_bar",
            slug: "03_bar",
            title: "Bar",
            markdown: "bar",
            sections: [],
          },
        ],
      },
      {
        id: "_02_part_2",
        slug: "02_part_2",
        title: "Second Part",
        markdown: "",
        sections: [
          {
            id: "_02_part_2_01_hello",
            slug: "01_hello",
            title: "Hello",
            markdown: "World",
            sections: [],
          },
          {
            id: "_02_part_2_02_foo_bar_baz",
            slug: "02_foo_bar_baz",
            title: "Quick Brown",
            markdown: "The foxy fox",
            sections: [],
          },
        ],
      },
    ],
  } satisfies Book;

  (expected.chapters[0].sections[0] as any).parent = expected.chapters[0];
  (expected.chapters[0].sections[1] as any).parent = expected.chapters[0];
  (expected.chapters[0].sections[2] as any).parent = expected.chapters[0];
  (expected.chapters[1].sections[0] as any).parent = expected.chapters[1];
  (expected.chapters[1].sections[1] as any).parent = expected.chapters[1];

  expect(book).toEqual<Book>(expected);
});

test("load chapters ignores .git, .gitignore, and out", async () => {
  const fs = new GitAwareFs(
    "/",
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

  const book = await load(fs, {} as JiffbookSettings);
  const expected = {
    styles: [],
    scripts: [],
    tocDepth: 999,
    cover: {
      title: "Medina-99",
      author: "David Souther",
    },
    chapters: [
      {
        id: "_01_intro",
        slug: "01_intro",
        title: "Intro",
        parent: undefined,
        markdown: "",
        sections: [
          {
            id: "_01_intro_01_hello",
            slug: "01_hello",
            title: "Hello",
            markdown: "Hello",
            sections: [],
            parent: undefined,
          },
        ],
      },
    ],
  } satisfies Book;
  (expected.chapters[0].sections[0].parent as unknown as Section) =
    expected.chapters[0];

  expect(book).toEqual<Book>(expected);
});

test("load chapters ignores skip", async () => {
  const fs = new GitAwareFs(
    "/",
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

  const book = await load(fs, {} as JiffbookSettings);
  const expected = {
    styles: [],
    scripts: [],
    tocDepth: 999,
    cover: {
      title: "Medina-99",
      author: "David Souther",
    },
    chapters: [
      {
        id: "_02_other",
        slug: "02_other",
        title: "Other",
        parent: undefined,
        markdown: "",
        sections: [],
      },
    ],
  } satisfies Book;

  expect(book).toEqual<Book>(expected);
});

test("loads ailly content", async () => {
  const fs = new GitAwareFs(
    "/",
    new ObjectFileSystemAdapter({
      ".jiffbookrc": `title: Medina-99\nauthor: David Souther\n`,
      "01_intro": {
        ".aillyrc": "Intro",
        "01_hello.md": "Hello",
      },
    })
  );

  const book = await load(fs, {} as JiffbookSettings);
  const expected: Book = {
    styles: [],
    scripts: [],
    tocDepth: 999,
    cover: {
      title: "Medina-99",
      author: "David Souther",
    },
    chapters: [
      {
        id: "_01_intro",
        slug: "01_intro",
        title: "Intro",
        parent: undefined,
        markdown: "Intro",
        sections: [
          {
            id: "_01_intro_01_hello",
            slug: "01_hello",
            title: "Hello",
            parent: undefined,
            markdown: "Hello",
            sections: [],
          },
        ],
      },
    ],
  };
  expected.chapters[0].sections[0].parent = expected.chapters[0];

  expect(book).toEqual<Book>(expected);
});
