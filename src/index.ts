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

  fs.pushd(settings.out);
  await writeOut(loaded);
  fs.popd();

  // Copy static/* to out
  for (const file of await fs.readdir("./static")) {
    if (file === ".jiffbookrc") continue;
    console.log(`cp static/${file} out/${file}`);
    fs.copyFile(`static/${file}`, `out/${file}`);
  }

  if (book.ghPages) {
    console.log("Setting .nokjekyll for github pages deployment");
    fs.writeFile("out/.nojekyll", "");
  }
}
