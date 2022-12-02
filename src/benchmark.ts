import { add, suite, save } from "benny";
import cycle from "../node_modules/benny/lib/cycle";
import { convertToSuperEntitiesWithGenerators } from "./generators";
import { createLookupMap, getEntities } from "./helpers";
import {
  convertToSuperEntities,
  convertToSuperEntitiesWithLoop,
} from "./index";
import { convertToSuperEntitiesWithIterators } from "./iterators";

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

async function runMore() {
  for (let n = 100; n < 100000; n += 100) {
    await run(n);
  }
}
