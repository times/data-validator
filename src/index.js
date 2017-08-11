export { all, allWhileOK, some } from './lib/compose';

export {
  ok,
  err,
  isOK,
  isErr,
  toResult,
  mapErrors,
  prefixErrors,
  flattenResults,
  getErrors,
} from './lib/result';

export {
  validateAsObjectSchema,
  validateAsArraySchema,
  fromObjectSchema,
  fromObjectSchemaStrict,
  fromArraySchema,
  objectValidator,
  arrayValidator,
} from './lib/schema';

export {
  isISOString,
  isDate,
  isObject,
  isArray,
  isType,
} from './lib/typecheck';

export {
  alwaysErr,
  alwaysOK,
  fromPredicate,
  validateIsType,
  validateIsIn,
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateObjPropPasses,
  validateObjOnlyHasKeys,
  validateIsArray,
  validateArrayItemsHaveType,
  validateArrayItemsPass,
} from './lib/validators';
