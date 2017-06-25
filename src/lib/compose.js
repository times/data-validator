// @flow

import { isOK, ok, isErr, err } from './result';
import type { Result } from './result';

import { isObject } from './helpers';

import {
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateObjPropPasses,
  validateIsArray,
  validateArrayItemsHaveType,
  validateArrayItemsPass,
} from './validators';
import type { Validator, Data } from './validators';

/**
 * Types
 */
type SchemaField = {
  required?: boolean,
  type?: string,
  validator?: Validator,
};
type Schema = { [key: string]: SchemaField };

type Compose = Array<Validator> => (Data) => Result;

/**
 * Run a series of validators (left-to-right) such that all of the
 * validators must succeed. Otherwise, returns the first set of errors
 */
export const all: Compose = validators => data =>
  validators.reduce((res, v) => (isOK(res) ? v(data) : res), ok());

/**
 * Run a series of validators such that at least one of the validators must
 * succeed. Otherwise, returns all of the errors
 */
export const some: Compose = validators => data =>
  validators.reduce((res, v) => {
    if (isOK(res)) return res;
    const vRes = v(data);
    return isErr(vRes) ? err([...res.errors, ...vRes.errors]) : vRes;
  }, err([]));

/**
 * Convert an object schema to an array of validators
 */
type FromObjectSchema = Schema => Array<Validator>;
export const fromObjectSchema: FromObjectSchema = (schema = {}) => {
  const defaultVs = [validateIsObject];

  if (!isObject(schema)) return defaultVs;

  return Object.keys(schema).reduce((vs, k) => {
    const rules = schema[k];

    let extraVs = [];
    if (rules.required === true) extraVs = [...extraVs, validateObjHasKey(k)];
    if (rules.type)
      extraVs = [...extraVs, validateObjPropHasType(rules.type)(k)];
    if (rules.validator)
      extraVs = [...extraVs, validateObjPropPasses(rules.validator)(k)];

    return [...vs, ...extraVs];
  }, defaultVs);
};

/**
 * Convert an array schema to an array of validators
 */
type FromArraySchema = SchemaField => Array<Validator>;
export const fromArraySchema: SchemaField = (schema = {}) => {
  const defaultVs = [validateIsArray];

  if (!isObject(schema)) return defaultVs;

  let extraVs = [];
  if (schema.type)
    extraVs = [...extraVs, validateArrayItemsHaveType(schema.type)];
  if (schema.validator)
    extraVs = [...extraVs, validateArrayItemsPass(schema.validator)];

  return [...defaultVs, ...extraVs];
};

// /**
//  * Precomposed validator for objects
//  */
// const objectValidator = allOf(
//   X validateIsObject,
//   X validateRequiredFields,
//   validateExtraFields,
//   X validateFieldsTypecheck,
//   validateFieldPredicates,
//   X validateFieldSchemaValidators
// );

// /**
//  * Precomposed validator for arrays
//  */
// const arrayValidator = allOf(
//   X validateIsArray,
//   X validateItemsTypecheck,
//   validateArrayPredicates,
//   X validateArraySchemaValidator
// );
