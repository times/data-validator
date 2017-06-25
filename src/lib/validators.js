// @flow

import { isObject, isArray, typechecks } from './helpers';

import { ok, err, toResult, mapErrors, flattenResults } from './result';
import type { Result, Errors } from './result';

/**
 * Types
 */
export type Data = any;

export type Validator = Data => Result;

/**
 * Is the given data an object?
 */
type ValidateIsObject = Validator;
export const validateIsObject: ValidateIsObject = data =>
  (isObject(data) ? ok() : err([`Data was not an object`]));

/**
 * Does the object have the given key?
 */
type ValidateObjHasKey = string => Validator;
export const validateObjHasKey: ValidateObjHasKey = key => obj =>
  (obj.hasOwnProperty(key) ? ok() : err([`Missing required field "${key}"`]));

/**
 * If the given object property exists, does it typecheck?
 */
type ValidateObjPropHasType = string => (string) => Validator;
export const validateObjPropHasType: ValidateObjPropHasType = type => key => obj => {
  if (!obj.hasOwnProperty(key)) return ok();
  return typechecks(obj[key], type)
    ? ok()
    : err([`Field "${key}" failed to typecheck (expected ${type})`]);
};

/**
 * If the given object property exists, does it pass the given validator?
 */
type ValidateObjPropPasses = Validator => (string) => Validator;
export const validateObjPropPasses: ValidateObjPropPasses = v => key => obj => {
  if (!obj.hasOwnProperty(key)) return ok();
  return mapErrors(e => `At field "${key}": ${e}`)(v(obj[key]));
};

/**
 * Is the given data an array?
 */
type ValidateIsArray = Validator;
export const validateIsArray: ValidateIsArray = data =>
  (isArray(data) ? ok() : err([`Data was not an array`]));

/**
 * Does each array item typecheck?
 */
type ValidateArrayItemsHaveType = string => Validator;
export const validateArrayItemsHaveType: ValidateArrayItemsHaveType = type => arr =>
  toResult(
    arr
      .filter(a => !typechecks(a, type))
      .map(a => `Item "${a}" failed to typecheck (expected ${type})`)
  );

/**
 * Does each array item pass the given validator?
 */
type ValidateArrayItemsPass = Validator => Validator;
export const validateArrayItemsPass: ValidateArrayItemsPass = v => arr =>
  flattenResults(
    arr.map(v).map((res, i) => mapErrors(e => `At item ${i}: ${e}`)(res))
  );

/**
 * Are there any extra object fields present?
 */
// module.exports.validateExtraFields = schema => data =>
//   Object.keys(data)
//     .filter(k => !schema.hasOwnProperty(k))
//     .map(k => `Extra field "${k}"`)
//     .toResult();
