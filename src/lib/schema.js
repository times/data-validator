// @flow

import {
  type Validator,
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateObjPropPasses,
  validateObjOnlyHasKeys,
  validateIsArray,
  validateArrayItemsHaveType,
  validateArrayItemsPass,
  alwaysOK,
  alwaysErr
} from './validators';

import { all, allWhileOK } from './compose';
import { type Result, isErr, err, mapErrors } from './result';
import { getErrors } from './printer';
import { isObject } from './typecheck';

/**
 * Types
 */
type SchemaRules = {
  required?: boolean,
  type?: string,
  validator?: Validator
};

type ArraySchema = SchemaRules;
type ObjectSchema = { +[key: string]: SchemaRules };

/**
 * Convert a schema rule to a validator
 */
type ConvertSchemaRuleToValidator = string => Validator;
const convertSchemaRuleToValidator: ConvertSchemaRuleToValidator = key => {
  switch (key) {
    case 'required':
      return validateObjPropHasType('boolean')('required');
    case 'type':
      return validateObjPropHasType('string')('type');
    case 'validator':
      return validateObjPropHasType('function')('validator');
    default:
      return alwaysOK();
  }
};

/**
 * Validates a set of schema rules as valid
 */
type ValidateAsSchemaRules = SchemaRules => Result;
const validateAsSchemaRules: ValidateAsSchemaRules = rules => {
  const ruleValidators = Object.keys(rules).map(convertSchemaRuleToValidator);
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
type ProcessSchemaError = Result => Array<Validator>;
const processSchemaError: ProcessSchemaError = schemaResult => [
  alwaysErr(getErrors(mapErrors(err => `Schema error: ${err}`)(schemaResult)))
];

/**
 * Returns a result, having validated the supplied ObjectSchema
 */
type ValidateAsObjectSchema = ObjectSchema => Result;
export const validateAsObjectSchema: ValidateAsObjectSchema = schema =>
  allWhileOK([
    validateIsObject,
    ...Object.keys(schema).map(validateAsNestedSchemaRules)
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
    .map(k => {
      const type = schema[k].type;
      return type ? validateObjPropHasType(type)(k) : null;
    })
    .filter(Boolean);

  const validatorChecks = Object.keys(schema)
    .map(k => {
      const validator = schema[k].validator;
      return validator ? validateObjPropPasses(validator)(k) : null;
    })
    .filter(Boolean);

  return [
    validateIsObject,
    all(requiredChecks),
    all(typeChecks),
    all(validatorChecks)
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

  const vs = Object.keys(schema)
    .map(k => {
      if (k === 'type' && schema[k]) {
        return validateArrayItemsHaveType(schema[k]);
      } else if (k === 'validator' && schema[k]) {
        return validateArrayItemsPass(schema[k]);
      } else return null;
    })
    .filter(Boolean);

  return [validateIsArray, ...vs];
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
