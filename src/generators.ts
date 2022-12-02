import {
  Entity,
  isEntityGroupBig,
  isSuperEntity,
  isValueGreaterThatTwo,
  mapToSuperEntity,
  SuperEntity,
} from "./helpers";

export function* map<Input, Output>(
  functor: (args: Input) => Output,
  entries: Iterable<Input>
): Iterable<Output> {
  for (const entry of entries) {
    yield functor(entry);
  }
}

type TypeguardPredicate<InputType, OutputType extends InputType> = (
  value: InputType
) => value is OutputType;
type BooleanPredicate<InputType> = (value: InputType) => boolean;
type Predicate<InputType, OutputType extends InputType> =
  | TypeguardPredicate<InputType, OutputType>
  | BooleanPredicate<InputType>;

export function* filter<InputType, OutputType extends InputType>(
  predicate: Predicate<InputType, OutputType>,
  entries: Iterable<InputType>
): Iterable<OutputType> {
  for (const entry of entries) {
    if (predicate(entry)) {
      yield entry;
    }
  }
}

export function convertToSuperEntitiesWithGenerators(
  lookup: Map<number, Entity[]>,
  entities: Entity[]
): SuperEntity[] {
  const sizeFilter = isEntityGroupBig.bind(null, lookup, entities.length);
  const greaterThanTwo = filter(isValueGreaterThatTwo, entities);
  const hasMoreThanHundred = filter(sizeFilter, greaterThanTwo);
  const mapped = map(
    (entity) => mapToSuperEntity(lookup, entity),
    hasMoreThanHundred
  );
  return [...filter(isSuperEntity, mapped)];
}
