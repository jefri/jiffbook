export interface Book {
  cover: {
    title: string;
    subtitle?: string;
    author: string;
    image?: Image;
    license?: License;
  };
  chapters: Section[];
}

export interface SectionBase {
  slug: string; // From basename.
  title: string; // Given in metadata, or inferred from basename.
  book: Book;
  parent?: SectionFolder; // Makes it easy to look up the breadcrumb.
}
export interface SectionFolder extends SectionBase {
  sections: Section[];
}

export interface SectionContent extends SectionBase {
  markdown: string;
  images?: Image[];
}

export type Section = SectionContent | SectionFolder;

export interface Image {
  source: string;
  dest: string;
}

export interface License {
  short: string;
  spdx: string;
  full: string;
}
