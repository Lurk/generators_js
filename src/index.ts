import {
  Entity,
  SuperEntity,
  isValueGreaterThatTwo,
  isEntityGroupBig,
  isSuperEntity,
  mapToSuperEntity,
} from "./helpers";

export function convertToSuperEntities(
  lookup: Map<number, Entity[]>,
  entities: Entity[]
): SuperEntity[] {
  const sizeFilter = isEntityGroupBig.bind(null, lookup, entities.length);
  return entities
    .filter(isValueGreaterThatTwo)
    .filter(sizeFilter)
    .map((entity) => mapToSuperEntity(lookup, entity))
    .filter(isSuperEntity);
}

export function convertToSuperEntitiesWithLoop(
  lookup: Map<number, Entity[]>,
  entities: Entity[]
): SuperEntity[] {
  const result: SuperEntity[] = new Array(entities.length);
  const sizeFilter = isEntityGroupBig.bind(null, lookup, entities.length);
  let j = 0;
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    if (isValueGreaterThatTwo(entity) && sizeFilter(entity)) {
      const superEntity = mapToSuperEntity(lookup, entity);
      if (isSuperEntity(superEntity)) {
        result[j] = superEntity;
        j++;
      }
    }
  }
  return result.slice(0, j);
}
