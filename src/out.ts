import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { JiffdownSettings } from "./fs.js";
import { isSectionContent, pathForSection } from "./sections.js";
import { Book, Section } from "./types.js";
import {
  Cover,
  Layout,
  Page,
  SectionPage,
  SectionTOCPage,
  Single,
  TableOfContents,
} from "./components.js";
import { div, main } from "./dom.js";

export async function writeOut({
  fs,
  settings,
  book,
}: {
  fs: FileSystem;
  book: Book;
  settings: JiffdownSettings;
}): Promise<null> {
  await writeHtmlPage(fs, "index.html", [
    div({ className: "cover" }, ...Cover(book)),
  ]);
  await writeHtmlPage(
    fs,
    "toc.html",
    Page(book, main({ className: "table-of-contents" }, TableOfContents(book)))
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
    writeHtmlPage(fs, path, SectionPage(section, false));
  } else {
    await fs.mkdir(section.slug);
    await fs.pushd(section.slug);
    await writeHtmlPage(
      fs,
      "index.html",
      SectionTOCPage(section, depth, false)
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
