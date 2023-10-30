import { a } from "../dom.js";

export function A({ href }: { href: string }, title: string): string {
  return a({ href } as any, title);
}
