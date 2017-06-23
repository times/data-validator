// @flow

import { isOK, ok, isErr, err, toResult } from './result';
import type { Result, Errors } from './result';

// Types
type Data = any;
type Schema = any;

type Validator = Data => Result;

type Runner = (...vs: Array<Validator>) => (Data) => Result;

// Test validator functions
const isArray: Validator = data =>
  (Array.isArray(data) ? ok() : err(['not array']));

const isObject: Validator = data =>
  (typeof data === 'object' ? ok() : err(['not object']));

// Actual functions

/**
 * Composes a series of validators using the provided `run` function
 *
 * compose :: ([val] -> Result) -> [val] -> val
 */
const compose = (run: Runner) => (...validators: Array<Validator>) => (
  data: Data
): Result => run(...validators)(data);

/**
 * Run a series of validators (left-to-right) such that all of the
 * validators must succeed. Otherwise, returns the first set of errors
 *
 * all :: [val] -> data -> Result
 */
const all = (...validators: Array<Validator>) => (data: Data): Result =>
  validators.reduce((res, v) => (isOK(res) ? v(data) : res), ok());

/**
 * Run a series of validators such that at least one of the validators must
 * succeed. Otherwise, returns all of the errors
 *
 * some :: [val] -> data -> Result
 */
const some = (...validators: Array<Validator>) => (data: Data): Result =>
  validators.reduce((res, v) => {
    if (isOK(res)) return res;
    const vRes = v(data);
    return isErr(vRes) ? err([...res.errors, ...vRes.errors]) : vRes;
  }, err([]));

export const testAll: Validator = compose(all)(isArray, isObject);
export const testSome: Validator = compose(some)(isArray, isObject);

// convert :: schema -> [val]
// const convert = ...

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
