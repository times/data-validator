// @flow

import { isOK, ok, isErr, err } from './result';
import type { Result } from './result';

import { isObject } from './helpers';

import {
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
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
 * Convert a schema to an array of validators
 */
type Convert = Schema => Array<Validator>;
export const fromObjectSchema: Convert = (schema = {}) => {
  const defaultVs = [validateIsObject];

  if (!isObject(schema)) return defaultVs;

  return Object.keys(schema).reduce((vs, k) => {
    const val = schema[k];

    let extraVs = [];
    if (val.required === true) extraVs = [...extraVs, validateObjHasKey(k)];
    if (val.type) extraVs = [...extraVs, validateObjPropHasType(val.type)(k)];

    return [...vs, ...extraVs];
  }, defaultVs);
};

// const {
//   validateIsObject,
//   validateIsArray,
//   validateRequiredFields,
//   validateExtraFields,
//   // validateFieldPredicates,
//   // validateArrayPredicates,
//   validateFieldsTypecheck,
//   validateItemsTypecheck,
//   validateFieldSchemaValidators,
//   validateArraySchemaValidator,
// } = require('./validators');

// /**
//  * Precomposed validator for objects
//  */
// const objectValidator = allOf(
//   validateIsObject,
//   validateRequiredFields,
//   validateExtraFields,
//   validateFieldsTypecheck,
//   // validateFieldPredicates,
//   validateFieldSchemaValidators
// );

// /**
//  * Precomposed validator for arrays
//  */
// const arrayValidator = allOf(
//   validateIsArray,
//   validateItemsTypecheck,
//   // validateArrayPredicates,
//   validateArraySchemaValidator
// );

// module.exports = {
//   allOf,
//   someOf,
//   objectValidator,
//   arrayValidator,
// };
