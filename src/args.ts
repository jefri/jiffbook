import { parseArgs } from "node:util";
import { join } from "node:path";

export type Args = ReturnType<typeof makeArgs>;
export function makeArgs(argv = process.argv) {
  const args = parseArgs({
    args: argv,
    options: {
      root: {
        type: "string",
        short: "r",
        default: process.cwd(),
      },
      out: {
        type: "string",
        short: "o",
        default: "out",
      },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  return args;
}

export function help(): never {
  console.log(`usage: jiffdoc [options]
  options:
    -r, --root sets the base folder to read a jiffdoc book from. Default: ${process.cwd()}
    -o, --out sets the target folder to generate the jiffdoc book HTML to. Default: ${process.cwd()}/out

    -h, --help will print this message and exit.
  `);

  process.exit(1);
}
