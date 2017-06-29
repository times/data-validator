import type { ObjectSchema, SchemaRules } from './compose';

import { all, allWhileOK } from './compose';

import {
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateObjPropPasses,
  validateObjOnlyHasKeys,
  validateIsArray,
  validateArrayItemsHaveType,
  validateArrayItemsPass,
  alwaysErr,
} from './validators';

import { isErr, err, mapErrors, getErrors } from './result';

import { flatten, isObject } from './helpers';

type ConvertToValidator = String => Validator;
const convertToValidator: ConvertToValidator = key => {
  if (key === 'required') return validateObjPropHasType('boolean')('required');
  if (key === 'type') return validateObjPropHasType('string')('type');
  return validateObjPropHasType('function')('validator');
};

/**
 * Validates a set of schema rules as valid
 */
type ValidateAsSchemaRules = SchemaRules => Result;
const validateAsSchemaRules: ValidateAsSchemaRules = rules => {
  const ruleValidators = Object.keys(rules)
    .filter(k => ['required', 'type', 'validator'].includes(k))
    .map(convertToValidator);

  return allWhileOK([validateIsObject, ...ruleValidators])(rules);
};

/**
 * Validates a segment of an object schema as a valid set of schema rules
 */
type ValidateAsNestedSchemaRules = string => SchemaRules => Result;
const validateAsNestedSchemaRules: ValidateAsNestedSchemaRules = field => schema =>
  validateAsSchemaRules(schema[field]);

/**
 * Enforces a failed validation if the schema is invalid
 */
type ProcessSchemaError = SchemaResult => Array<Validator>;
export const processSchemaError: ProcessSchemaError = schemaResult => [
  alwaysErr(getErrors(mapErrors(err => `Schema error: ${err}`)(schemaResult))),
];

/**
 * Returns a result, having validated the supplied ObjectSchema
 */
type ValidateAsObjectSchema = ObjectSchema => Result;
export const validateAsObjectSchema: ValidateAsObjectSchema = schema =>
  allWhileOK([
    validateIsObject,
    ...Object.keys(schema).map(validateAsNestedSchemaRules),
  ])(schema);

/**
 * Returns a result, having validated the supplied ArraySchema
 */
type ValidateAsArraySchema = ArraySchema => Result;
export const validateAsArraySchema: ValidateAsArraySchema = schema =>
  allWhileOK([validateIsObject, validateAsSchemaRules])(schema);

/**
 * Convert an object schema to an array of validators
 */
type FromObjectSchema = ObjectSchema => Array<Validator>;
export const fromObjectSchema: FromObjectSchema = (schema = {}) => {
  if (!isObject(schema))
    return processSchemaError(err(['Schemas must be objects']));

  const schemaResult = validateAsObjectSchema(schema);
  if (isErr(schemaResult)) return processSchemaError(schemaResult);

  const requiredChecks = Object.keys(schema)
    .filter(k => schema[k].required)
    .map(validateObjHasKey);

  const typeChecks = Object.keys(schema)
    .filter(k => schema[k].type)
    .map(k => validateObjPropHasType(schema[k].type)(k));

  const validatorChecks = Object.keys(schema)
    .filter(k => schema[k].validator)
    .map(k => validateObjPropPasses(schema[k].validator)(k));

  return [
    validateIsObject,
    all(requiredChecks),
    all(typeChecks),
    all(validatorChecks),
  ];
};

/**
 * Convert an object schema to an array of validators and forbid extra fields
 */
export const fromObjectSchemaStrict: FromObjectSchema = (schema = {}) => {
  const vs = fromObjectSchema(schema);
  return isObject(schema)
    ? [...vs, validateObjOnlyHasKeys(Object.keys(schema))]
    : vs;
};

/**
 * Convert an array schema to an array of validators
 */
type FromArraySchema = ArraySchema => Array<Validator>;
export const fromArraySchema: FromArraySchema = (schema = {}) => {
  if (!isObject(schema))
    return processSchemaError(err(['Schemas must be objects']));

  const schemaResult = validateAsArraySchema(schema);
  if (isErr(schemaResult)) return processSchemaError(schemaResult);

  return Object.keys(schema)
    .map(k => {
      if (k === 'type' && schema[k]) {
        return [validateArrayItemsHaveType(schema[k])];
      } else if (k === 'validator' && schema[k]) {
        return [validateArrayItemsPass(schema[k])];
      } else return [];
    })
    .reduce(flatten, [validateIsArray]);
};

/**
 * Precomposed helper for objects
 */
type ObjectValidator = ObjectSchema => Validator;
export const objectValidator: ObjectValidator = schema =>
  allWhileOK(fromObjectSchemaStrict(schema));

/**
 * Precomposed helper for arrays
 */
type ArrayValidator = ArraySchema => Validator;
export const arrayValidator: ArrayValidator = schema =>
  allWhileOK(fromArraySchema(schema));
