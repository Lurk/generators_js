export interface Entity {
  groupId: number;
  value: number;
}

export interface SuperEntity {
  groupId: number;
  value: number;
  groupLength: number;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function getEntities(size: number): Entity[] {
  const result: Entity[] = new Array(size);
  for (let i = 0; i < size; i++) {
    result[i] = {
      groupId: getRandomInt(0, Math.ceil(size / 100)),
      value: getRandomInt(0, 100),
    };
  }
  return result;
}

export function createLookupMap(entities: Entity[]): Map<number, Entity[]> {
  let result: Map<number, Entity[]> = new Map();
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const val = result.get(entity.groupId);
    if (val) {
      val.push(entity);
    } else {
      result.set(entity.groupId, [entity]);
    }
  }
  return result;
}

export function isValueGreaterThatTwo(entity: Entity): boolean {
  return entity.value > 2;
}

export function isEntityGroupBig(
  lookup: Map<number, Entity[]>,
  allEntitiesCount: number,
  entity: Entity
): boolean {
  return (
    (allEntitiesCount / 100) * (lookup.get(entity.groupId)?.length || 0) > 1
  );
}

export function mapToSuperEntity(
  lookUp: Map<number, Entity[]>,
  entity: Entity
): SuperEntity | undefined {
  const group = lookUp.get(entity.groupId);
  if (group) {
    return {
      ...entity,
      groupLength: group.length,
    };
  }
}

export function isSuperEntity(
  val: SuperEntity | undefined
): val is SuperEntity {
  return val !== undefined;
}
