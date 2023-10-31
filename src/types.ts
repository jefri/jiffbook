export interface Book {
  cover: {
    title: string;
    subtitle?: string;
    author: string;
    image?: Image;
    license?: License;
  };
  chapters: Section[];
  tocDepth: number;
}

export interface Section {
  slug: string; // From basename.
  title: string; // Given in metadata, or inferred from basename.
  book: Book;
  parent?: Section; // Makes it easy to look up the breadcrumb.
  sections: Section[];
  markdown: string;
  images?: Image[];
}

export interface Image {
  source: string;
  dest: string;
}

export interface License {
  short: string;
  spdx: string;
  full: string;
}
