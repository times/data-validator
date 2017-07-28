export { all, allWhileOK, some } from './lib/compose';

export {
  ok,
  err,
  isOK,
  isErr,
  toResult,
  mapErrors,
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
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateObjPropPasses,
  validateObjOnlyHasKeys,
  validateIsArray,
  validateArrayItemsHaveType,
  validateArrayItemsPass,
  alwaysErr,
  alwaysOK,
} from './lib/validators';
