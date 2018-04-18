// @flow
export { all, allWhileOK, some } from './lib/compose';

export { printVerbose, getErrors } from './lib/printer';

export {
  ok,
  err,
  isOK,
  isErr,
  mapErrors,
  mergeResults,
  concatResults,
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
  isNull,
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
  validateObjFields,
  validateObjPropHasType,
  validateObjPropPasses,
  validateObjOnlyHasKeys,
  validateIsArray,
  validateArrayItems,
  validateArrayItemsHaveType,
} from './lib/validators';
