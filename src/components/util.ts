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
};
export function setBook(b: Book) {
  book = book;
}
export function useBook(): Book {
  return book;
}
