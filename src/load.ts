import * as yaml from "yaml";
import matter from "gray-matter";

import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { isSectionContent } from "./sections.js";
import { Book, Section, SectionContent, SectionFolder } from "./types.js";

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
export async function load(fs: FileSystem): Promise<Book> {
  const book = await loadBook(fs);

  return book;
}

export async function loadBook(fs: FileSystem): Promise<Book> {
  let rc: Record<string, string>;
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

  const title = rc["title"] ?? "Unknown Title";
  const author = rc["author"] ?? "Unknown Author";
  const image = rc["cover"];

  const chapters: Section[] = [];
  const dirs = (await fs.scandir(".")).filter((s) => s.isDirectory());
  for (const dir of dirs) {
    const section = await loadSectionFromFolder(fs, dir.name);
    chapters.push(section);
  }

  for (const section of chapters) {
    markSectionParents(section);
  }

  return {
    cover: {
      title,
      author,
      ...(image ? { image: { dest: image, source: image } } : {}),
    },
    chapters,
  };
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
): Promise<SectionFolder> {
  fs.pushd(slug);
  const rc = await fs.readFile(".jiffbookrc").catch((_) => "");
  const rcYaml = yaml.parse(rc) ?? {};
  const title = rcYaml["title"] ?? slugToName(slug);
  const entries = (await fs.scandir(".")).filter(
    (e) => e.name.match(/\d+_/) !== null
  );

  const sections: Section[] = [];
  for (const entry of entries) {
    let slug = entry.name;
    if (entry.isDirectory()) {
      sections.push(await loadSectionFromFolder(fs, slug));
    } else if (slug.endsWith(".md")) {
      sections.push(await loadSectionFromFile(fs, slug));
    }
  }

  fs.popd();

  return {
    slug,
    title,
    sections,
  };
}

async function loadSectionFromFile(
  fs: FileSystem,
  slug: string
): Promise<SectionContent> {
  const file = await fs.readFile(slug);
  const { content: markdown, data } = matter(file);
  slug = slug.replace(/\.md$/, "");
  const title = data["title"] ?? slugToName(slug);
  return {
    slug,
    title,
    markdown,
  };
}

export function markSectionParents(
  section: Section,
  parent?: SectionFolder
): void {
  section.parent = parent;
  if (!isSectionContent(section)) {
    for (const s of section.sections) {
      markSectionParents(s, section);
    }
  }
}
