import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { JiffbookSettings } from "./fs.js";
import { isSectionContent, pathForSection } from "./sections.js";
import { Book, Section } from "./types.js";
import { div, main } from "./dom.js";
import {
  Cover,
  Layout,
  Page,
  SectionPage,
  SectionTOCPage,
  Single,
} from "./components/pages.js";
import { TableOfContents } from "./components/contents.js";
import { setBook } from "./components/util.js";

export async function writeOut({
  fs,
  book,
}: {
  fs: FileSystem;
  book: Book;
  settings: JiffbookSettings;
}): Promise<null> {
  setBook(book);
  // Site main index
  await writeHtmlPage(fs, "index.html", [
    div({ className: "cover" }, ...Cover()),
  ]);
  // Site table of contents
  await writeHtmlPage(
    fs,
    "toc.html",
    Page(
      { className: "table-of-contents" },
      TableOfContents({ links: "relative" }, book)
    )
  );
  for (const chapter of book.chapters) {
    await writeSection(fs, chapter);
  }
  // Book as a single page
  await writeHtmlPage(fs, "single.html", Single({ book }));
  return null;
}

async function writeSection(fs: FileSystem, section: Section) {
  if (isSectionContent(section)) {
    const path = pathForSection(section);
    writeHtmlPage(fs, path, SectionPage({ links: "relative" }, section));
  } else {
    await fs.mkdir(section.slug);
    await fs.pushd(section.slug);
    // Section as an entire page.
    await writeHtmlPage(
      fs,
      "index.html",
      SectionPage({ links: "hash" }, section)
    );
    await writeHtmlPage(
      fs,
      "toc.html",
      SectionTOCPage({ links: "relative" }, section)
    );
    for (const s of section.sections) {
      await writeSection(fs, s);
    }
    await writeHtmlPage(
      fs,
      "single.html",
      SectionTOCPage({ links: "relative" }, section)
    );
    fs.popd();
  }
}

function writeHtmlPage(
  fs: FileSystem,
  name: string,
  html: string[]
): Promise<void> {
  console.log(`Writing ${fs.cwd()}/${name}`);
  return fs.writeFile(name, `<!doctype html>${Layout(...html)}`);
}
