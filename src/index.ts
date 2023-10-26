#!/usr/bin/env node
import { help, makeArgs } from "./args.js";
import { writeOut } from "./out.js";
import { writeSingle } from "./single.js";
import { loadFs } from "./fs.js";

await main();
async function main() {
  const args = makeArgs(process.argv.slice(2));

  if (args.values["help"]) {
    help();
  }

  const loaded = await loadFs(args);

  console.log(loaded);
  if (args.values.single) {
    await writeSingle(loaded);
  } else {
    await writeOut(loaded);
  }
}
