import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { JiffdownSettings } from "./fs.js";
import { isSectionContent, pathForSection } from "./sections.js";
import { Book, Section } from "./types.js";
import { Cover, Layout, SectionPage, TableOfContents } from "./components.js";

export async function writeOut({
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
  await writeHtmlPage(fs, "index.html", Cover(book));
  await writeHtmlPage(fs, "toc.html", [TableOfContents(book)]);
  for (const chapter of book.chapters) {
    await writeSection(fs, chapter);
  }
  fs.popd();
  return null;
}

async function writeSection(fs: FileSystem, section: Section) {
  if (isSectionContent(section)) {
    const path = pathForSection(section);
    writeHtmlPage(fs, path, SectionPage(section));
  } else {
    await fs.mkdir(section.slug);
    fs.pushd(section.slug);
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
  return fs.writeFile(name, `<!doctype html>${Layout(...html)}`);
}
