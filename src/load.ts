import * as yaml from "yaml";
import matter from "gray-matter";

import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { isSectionContent, sectionId } from "./sections.js";
import { Book, Section } from "./types.js";
import { JiffbookSettings } from "./fs.js";

/**
 * 1. Use package.json['jiffbook'] or '.jiffbookrc', taking first in order.
 * 2. Find Title, Author, Cover Image, and Copyright License.
 * 3. Load each folder in the CWD as a chapter, sorted by basename.
 * 4. Load the contents of each folder as sections in that folder.
 * 5. Set breadcrumb slugs as the basenames from the chapter to the file.
 *    1. Load breadcrumb titles from .jiffbookrc in each folder (or parse title from slug).
 *    1. Parse Title as drop leading /\d+_/, replace _ with space, and apply capitalization rules.
 * 7. Load Title from greymatter for the file (or parse title from slug).
 *
 * @param fs the FileSystem to read from, starting at the FS' CWD.
 * @returns
 */
export async function load(
  fs: FileSystem,
  args: JiffbookSettings
): Promise<Book> {
  let rc: Record<string, unknown>;
  try {
    let packageJson = await fs.readFile("package.json");
    let pkg = JSON.parse(packageJson);
    rc = pkg["jiffbook"];
  } catch (e) {
    try {
      let bookrc = await fs.readFile(".jiffbookrc");
      rc = yaml.parse(bookrc);
    } catch (e) {
      throw new Error("Could not find package.json or .jiffbookrc");
    }
  }

  const title = (rc["title"] as string) ?? "Unknown Title";
  const author = (rc["author"] as string) ?? "Unknown Author";
  const image = rc["cover"] as string | undefined;
  const styles = (rc["styles"] ?? []) as string[]; // TODO ensure they're a string list
  const scripts = (rc["scripts"] ?? []) as string[]; // TODO ensure they're a string list
  const ghPages = Boolean(rc["gh_pages"]);

  let tocDepth = Number(rc["toc_depth"] ?? 999);
  args["toc_depth"] = isNaN(tocDepth) ? 999 : tocDepth;

  const chapters: Section[] = [];

  const book: Book = {
    cover: {
      title,
      author,
      ...(image ? { image: { dest: image, source: image } } : {}),
    },
    chapters,
    tocDepth,
    styles,
    scripts,
  };

  if (ghPages) {
    book.ghPages = true;
  }

  const dirs = (await fs.scandir(".")).filter((s) => s.isDirectory());
  for (const dir of dirs) {
    const section = await loadSectionFromFolder(fs, dir.name);
    if (section) chapters.push(section);
  }

  for (const section of chapters) {
    markSectionParents(section);
  }

  return book;
}

export function slugToName(slug: string): string {
  return slug
    .replace(/^\d+/, "")
    .replace(/_[a-zA-Z]/g, (c) => " " + c.charAt(1).toLocaleUpperCase())
    .replace(/^ /, "");
}

async function loadSectionFromFolder(
  fs: FileSystem,
  slug: string
): Promise<Section | undefined> {
  fs.pushd(slug);

  const rc = await fs.readFile(".jiffbookrc").catch((_) => "");
  const data = yaml.parse(rc) ?? {};
  if (data["skip"]) {
    fs.popd();
    return;
  }

  const ailly = matter(await fs.readFile(".aillyrc").catch((_) => ""));
  const markdown: string = data["content"] ?? ailly.content;

  const title = data["title"] ?? slugToName(slug);
  const entries = (await fs.scandir(".")).filter(
    (e) => e.name.match(/\d+_/) !== null
  );

  const sections: Section[] = [];
  for (const entry of entries) {
    const slug = entry.name;
    let section: Section | undefined;
    if (entry.isDirectory()) {
      section = await loadSectionFromFolder(fs, slug);
    } else if (slug.endsWith(".md")) {
      section = await loadSectionFromFile(fs, slug);
    }
    if (section) sections.push(section);
  }

  fs.popd();

  return {
    id: "NOT YET FILLED",
    slug,
    title,
    sections,
    markdown,
  };
}

async function loadSectionFromFile(
  fs: FileSystem,
  slug: string
): Promise<Section | undefined> {
  const file = await fs.readFile(slug);
  const { content: markdown, data } = matter(file);
  if (data["skip"]) return;
  slug = slug.replace(/\.md$/, "");
  const title = data["title"] ?? slugToName(slug);
  return {
    slug,
    title,
    markdown,
    sections: [],
    id: "",
  };
}

export function markSectionParents(section: Section, parent?: Section): void {
  section.parent = parent;
  if (!isSectionContent(section)) {
    for (const s of section.sections) {
      markSectionParents(s, section);
    }
  }
  section.id = sectionId(section);
}
