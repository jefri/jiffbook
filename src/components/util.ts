import { Book } from "src/types.js";
import { a } from "../dom.js";

export function A({ href }: { href: string }, title: string): string {
  return a({ href } as any, title);
}

let book: Book = {
  cover: {
    author: "unknown",
    title: "unknown",
  },
  tocDepth: 999,
  chapters: [],
  styles: [],
};
export function setBook(b: Book) {
  book = b;
}
export function useBook(): Book {
  return book;
}

export function C(comment: string): string {
  return `<!-- ${comment} -->`;
}
