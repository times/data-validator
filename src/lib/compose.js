// @flow

import {
  isOK,
  ok,
  isErr,
  err,
  flattenResults,
  mapErrors,
  getErrors,
} from './result';
import type { Result } from './result';

import { isObject } from './helpers';

import {
  validateAsObjectSchema,
  validateAsArraySchema,
  processSchemaError,
} from './internal';

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
  alwaysOk,
} from './validators';
import type { Validator, Data } from './validators';

/**
 * Types
 */
export type SchemaRules = {
  required?: boolean,
  type?: string,
  validator?: Validator,
};

type ArraySchema = SchemaRules;
export type ObjectSchema = { [key: string]: SchemaRules };

type Composer = (Array<Validator>) => Data => Result;

/**
 * Run a series of validators (left-to-right) such that all of the
 * validators must succeed. Otherwise, returns the first set of errors
 */
export const allUntilFailure: Composer = validators => data =>
  validators.reduce((res, v) => (isOK(res) ? v(data) : res), ok());

/**
 * Run a series of validators (left-to-right) such that all of the
 * validators must succeed. Otherwise, return all of the errors
 */
export const all: Composer = validators => data =>
  flattenResults(validators.map(v => v(data)));

/**
 * Run a series of validators such that at least one of the validators must
 * succeed. Otherwise, returns all of the errors
 */
export const some: Composer = validators => data =>
  validators.reduce((res, v) => {
    if (isOK(res)) return res;
    const vRes = v(data);
    return isErr(vRes) ? err([...res.errors, ...vRes.errors]) : vRes;
  }, err([]));

// Helper
type Flatten = (Array<Validator>, Array<Validator>) => Array<Validator>;
export const flatten: Flatten = (acc, vs) => [...acc, ...vs];

/**
 * Convert an object schema to an array of validators
 */
type FromObjectSchema = ObjectSchema => Array<Validator>;
export const fromObjectSchema: FromObjectSchema = (schema = {}) => {
  if (!isObject(schema))
    return processSchemaError(err(['Schemas must be objects']));

  const schemaResult = validateAsObjectSchema(schema);
  if (isErr(schemaResult)) return processSchemaError(schemaResult);

  const requiredChecks = Object.keys(schema).map(
    k => (schema[k].required ? validateObjHasKey(k) : alwaysOk())
  );
  const typeChecks = Object.keys(schema).map(
    k =>
      schema[k].type ? validateObjPropHasType(schema[k].type)(k) : alwaysOk()
  );
  const validatorChecks = Object.keys(schema).map(
    k =>
      schema[k].validator
        ? validateObjPropPasses(schema[k].validator)(k)
        : alwaysOk()
  );

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
  allUntilFailure(fromObjectSchemaStrict(schema));

/**
 * Precomposed helper for arrays
 */
type ArrayValidator = ArraySchema => Validator;
export const arrayValidator: ArrayValidator = schema =>
  allUntilFailure(fromArraySchema(schema));
