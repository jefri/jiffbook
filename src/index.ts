#!/usr/bin/env node
import { help, makeArgs } from "./args.js";
import { write } from "./content.js";
import { loadFs } from "./fs.js";

await main();
async function main() {
  const args = makeArgs(process.argv.slice(2));

  if (args.values["help"]) {
    help();
  }

  const loaded = await loadFs(args);

  console.log(loaded);

  await write(loaded);
}
