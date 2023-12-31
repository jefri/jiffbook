import { NodeFileSystem } from "@davidsouther/jiffies/lib/esm/fs_node.js";
import { join, normalize } from "node:path";
import { Args } from "./args.js";
import { load } from "./load.js";
import {
  FileSystem,
  FileSystemAdapter,
  Stats,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import * as gitignoreParser from "gitignore-parser";
import { Book } from "./types.js";

export interface JiffbookSettings {
  out: string;
  toc_depth: number;
}

function cwdNormalize(path: string) {
  return normalize(path[0] == "/" ? path : join(process.cwd(), path));
}

export async function loadFs(
  args: Args
): Promise<{ fs: FileSystem; settings: JiffbookSettings; book: Book }> {
  const root = cwdNormalize(args.values.root!);
  const fs = new GitAwareFs(root, new NodeFileSystem());
  const settings = {
    out: join(args.values.root!, args.values.out!),
    toc_depth: Number.parseInt(args.values["toc-depth"] ?? "99999"),
  };

  let book = await load(fs, settings);

  return { fs, settings, book };
}

export class GitAwareFs extends FileSystem {
  constructor(cwd = process.cwd(), fsa: FileSystemAdapter) {
    super(fsa);
    this.cd(cwd);
  }

  private async gitignoreFilter(path: string) {
    return gitignoreParser.compile(
      (await this.readFile(join(path, ".gitignore")).catch((_) => "")) +
        "\n.git"
    );
  }

  async readdir(path: string): Promise<string[]> {
    if (path == ".git") return [];
    const filter = await this.gitignoreFilter(path);
    return (await super.readdir(path)).filter(
      (name) => filter.accepts(name) && name !== ".git"
    );
  }

  async scandir(path: string): Promise<Stats[]> {
    const filter = await this.gitignoreFilter(path);
    return (await super.scandir(path)).filter(({ name }) =>
      filter.accepts(name)
    );
  }
}
