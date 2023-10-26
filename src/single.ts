import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { JiffdownSettings } from "./fs.js";
import { Book, Section } from "./types.js";
import {
  Cover,
  Layout,
  SectionComponent,
  SectionMain,
  TableOfContents,
} from "./components.js";
import { isSectionContent } from "./sections.js";

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
    ...Cover(book),
    TableOfContents(book, settings.toc_depth),
    ...book.chapters.map(SectionComponent).flat()
  );
  await fs.writeFile("index.html", page);
  fs.popd();
  return null;
}
