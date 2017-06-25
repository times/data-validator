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

type Convert = Schema => Array<Validator>;

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
export const fromObjectSchema: Convert = (schema = {}) => {
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
export const fromArraySchema: Convert = (schema = {}) => {
  const defaultVs = [validateIsArray];

  if (!isObject(schema)) return defaultVs;

  return Object.keys(schema).reduce((vs, k) => {
    let extraVs = [];
    if (k === 'type')
      extraVs = [...extraVs, validateArrayItemsHaveType(schema[k])];

    // if (rules.validator)
    //   extraVs = [...extraVs, validateObjPropPasses(rules.validator)(k)];

    return [...vs, ...extraVs];
  }, defaultVs);

  return defaultVs;
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
