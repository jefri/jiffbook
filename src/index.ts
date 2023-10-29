#!/usr/bin/env node
import { help, makeArgs } from "./args.js";
import { writeOut } from "./out.js";
import { loadFs } from "./fs.js";

await main();
async function main() {
  const args = makeArgs(process.argv.slice(2));

  if (args.values["help"]) {
    help();
  }

  const loaded = await loadFs(args);
  let { fs, settings, book } = loaded;

  console.log(loaded);

  try {
    await fs.rm(settings.out);
  } catch (e) {
    console.log(`Did not clean ${settings.out}`, e);
  }
  await fs.mkdir(settings.out);
  fs.cd(settings.out);

  await writeOut(loaded);
}
