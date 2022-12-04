import { add, suite, save, cycle } from "benny";
import { readdir, writeFile, access, constants, rmdir } from "fs/promises";
import { join, parse } from "path";
import { convertToSuperEntitiesWithGenerators } from "./generators";
import { createLookupMap, getEntities } from "./helpers";
import {
  convertToSuperEntities,
  convertToSuperEntitiesWithLoop,
} from "./index";
import { convertToSuperEntitiesWithIterators } from "./iterators";

function getFilename(postfix: number, withExtension: boolean = false) {
  return `benchmark_${postfix}${withExtension ? ".json" : ""}`;
}

function getResultsDir(): string {
  return join(__dirname, "../benchmark/results");
}

async function gather(name: string) {
  const basePath = getResultsDir();
  const filenames = await readdir(basePath);

  const result = await Promise.all(
    filenames.map(async (filename) => {
      const size = parseInt(parse(filename).name.split("_")[1]);
      const path = join(basePath, filename);
      const data = await import(path);
      return data.results.map((r) => ({ ...r, size }));
    })
  );
  return writeFile(
    join(__dirname, `../benchmark/${name}.json`),
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
    save({ file: getFilename(n), version: `${n}` }),
    cycle()
  );
}
async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

async function repeat(nameOfTheRun: string, startOver: boolean = true) {
  const resultDir = getResultsDir();
  if (startOver) {
    await rmdir(resultDir, { recursive: true });
  }
  for (let n = 100; n < 100000; n += 10) {
    if (startOver || !(await exists(join(resultDir, getFilename(n, true))))) {
      await run(n);
    }
  }
  await gather(nameOfTheRun);
}
