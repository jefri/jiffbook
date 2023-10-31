import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { JiffdownSettings } from "./fs.js";
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
  settings,
  book,
}: {
  fs: FileSystem;
  book: Book;
  settings: JiffdownSettings;
}): Promise<null> {
  setBook(book);
  await writeHtmlPage(fs, "index.html", [
    div({ className: "cover" }, ...Cover({}, book)),
  ]);
  await writeHtmlPage(
    fs,
    "toc.html",
    Page(
      main(
        { className: "table-of-contents" },
        TableOfContents({ links: "absolute" }, book)
      )
    )
  );
  for (const chapter of book.chapters) {
    await writeSection(fs, chapter);
  }
  await writeHtmlPage(fs, "single.html", Single({ settings, book }));
  return null;
}

async function writeSection(
  fs: FileSystem,
  section: Section,
  depth: number = -1
) {
  if (isSectionContent(section)) {
    const path = pathForSection(section);
    writeHtmlPage(fs, path, SectionPage({ links: "hash" }, section));
  } else {
    await fs.mkdir(section.slug);
    await fs.pushd(section.slug);
    await writeHtmlPage(
      fs,
      "index.html",
      SectionPage({ links: "hash" }, section)
    );
    await writeHtmlPage(
      fs,
      "toc.html",
      SectionTOCPage({ depth, links: "hash" }, section)
    );
    for (const s of section.sections) {
      await writeSection(fs, s);
    }
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
