import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { JiffdownSettings } from "./fs.js";
import { Book } from "./types.js";
import {
  Cover,
  Layout,
  SectionComponent,
  TableOfContents,
} from "./components.js";
import { aside, footer, header, main, nav, style } from "./dom.js";

export async function writeSingle({
  fs,
  settings,
  book,
}: {
  fs: FileSystem;
  book: Book;
  settings: JiffdownSettings;
}): Promise<null> {
  try {
    await fs.rm(settings.out);
  } catch (e) {
    console.log(`Did not clean ${settings.out}`, e);
  }
  await fs.mkdir(settings.out);
  fs.cd(settings.out);

  const page = Layout(
    header({ className: "fluid" }, nav(...Cover(book, true))),
    main(...book.chapters.map((s) => SectionComponent(s, true)).flat()),
    aside({ id: "toc" }, nav(TableOfContents(book, settings.toc_depth, true))),
    footer(
      { className: "fluid" },
      `©${new Date().getFullYear()} ${book.cover.author}`
    ),
    style(singleStyle)
  );
  await fs.writeFile("index.html", page);
  fs.popd();
  return null;
}

const singleStyle = `
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Poppins:ital,wght@0,400;0,700;1,400;1,700&display=swap');

:root {
  --font-family-base: Poppins;
  --font-family-header: "Libre Baskerville";
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

aside nav ul li a {
  white-space: nowrap;
}
`;
