import { add, suite, save } from "benny";
import { fstat } from "fs";
import cycle from "../node_modules/benny/lib/cycle";
import { convertToSuperEntitiesWithGenerators } from "./generators";
import { createLookupMap, getEntities } from "./helpers";
import {
  convertToSuperEntities,
  convertToSuperEntitiesWithLoop,
} from "./index";
import { convertToSuperEntitiesWithIterators } from "./iterators";
import { readdir, writeFile } from "fs/promises";
import { join, parse } from "path";

async function gather() {
  const base_path = join(__dirname, "../benchmark/results");
  const filenames = await readdir(base_path);

  const result = await Promise.all(
    filenames.map(async (filename) => {
      const size = parseInt(parse(filename).name.split("_")[1]);
      const path = join(base_path, filename);
      const data = await import(path);
      return data.results.map((r) => ({ ...r, size }));
    })
  );
  return writeFile(
    join(__dirname, "../benchmark/result.json"),
    JSON.stringify(result.flat())
  );
}

async function run(n: number) {
  const entities = getEntities(n);
  const lookup = createLookupMap(entities);
  return suite(
    `Entity(${n}) to SuperEntity transformer`,
    add("array methods", () => {
      return convertToSuperEntities(lookup, entities);
    }),
    add("for loop", () => {
      return convertToSuperEntitiesWithLoop(lookup, entities);
    }),
    add("generators", () => {
      return convertToSuperEntitiesWithGenerators(lookup, entities);
    }),
    add("iterators", () => {
      return convertToSuperEntitiesWithIterators(lookup, entities);
    }),
    save({ file: `benchmark_${n}`, version: `${n}` }),
    cycle()
  );
}

async function repeat() {
  for (let n = 100; n < 100000; n += 100) {
    await run(n);
  }
  gather();
}
