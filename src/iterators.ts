import {
  Entity,
  isEntityGroupBig,
  isSuperEntity,
  isValueGreaterThatTwo,
  mapToSuperEntity,
  SuperEntity,
} from "./helpers";

export function map<InputType, OutputType>(
  functor: (arg: InputType) => OutputType,
  iterable: Iterable<InputType>
): Iterable<OutputType> {
  return {
    [Symbol.iterator]() {
      const iterator = iterable[Symbol.iterator]();
      return {
        next() {
          const { value, done } = iterator.next();
          if (done) {
            return {
              value: undefined,
              done: true,
            };
          } else {
            return {
              value: functor(value),
              done: false,
            };
          }
        },
      };
    },
  };
}

type TypeguardPredicate<InputType, OutputType extends InputType> = (
  value: InputType
) => value is OutputType;
type BooleanPredicate<InputType> = (value: InputType) => boolean;
type Predicate<InputType, OutputType extends InputType> =
  | TypeguardPredicate<InputType, OutputType>
  | BooleanPredicate<InputType>;

export function filter<InputType, OutputType extends InputType>(
  predicate: Predicate<InputType, OutputType>,
  iterable: Iterable<InputType>
): Iterable<OutputType> {
  return {
    [Symbol.iterator]() {
      const iterator = iterable[Symbol.iterator]();
      return {
        next() {
          let { value, done } = iterator.next();
          while (done === false && !predicate(value)) {
            const result = iterator.next();
            value = result.value;
            done = result.done;
          }
          if (done) {
            return {
              value: undefined,
              done: true,
            };
          } else {
            return {
              value,
              done,
            };
          }
        },
      };
    },
  };
}

export function convertToSuperEntitiesWithIterators(
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
