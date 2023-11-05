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
  styles: string[];
}

export interface Section {
  id: string; // A cache of the id from the breadcrumb.
  slug: string; // From basename.
  title: string; // Given in metadata, or inferred from basename.
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
