// @flow

import { isType } from './typecheck';
import { ok, err, toResult, prefixErrors, flattenResults } from './result';
import type { Result, Errors } from './result';

/**
 * Types
 */
export type Data = any;

export type Validator = Data => Result;

/**
 * Always an error
 */
type AlwaysErr = Errors => Validator;
export const alwaysErr: AlwaysErr = errs => () => err(errs);

/**
 * Always OK
 */
type AlwaysOK = () => Validator;
export const alwaysOK: AlwaysOK = () => () => ok();

/**
 * Construct a validator from a boolean function
 */
type FromPredicate = ((Data) => boolean, (Data) => string) => Validator;
export const fromPredicate: FromPredicate = (test, toErrMsg) => data =>
  test(data) ? ok() : err([toErrMsg(data)]);

/**
 * Is the given object of the given type?
 */
type ValidateIsType = string => Validator;
export const validateIsType: ValidateIsType = type =>
  fromPredicate(
    isType(type),
    data => `"${data}" failed to typecheck (expected ${type})`
  );

/**
 * Is the given value in the given array of values?
 */
type ValidateIsIn = (Array<*>) => Validator;
export const validateIsIn: ValidateIsIn = values =>
  fromPredicate(
    val => values.includes(val),
    val => `Value must be one of ${values.join(', ')} (got "${val}")`
  );

/**
 * Is the given data an object?
 */
type ValidateIsObject = Validator;
export const validateIsObject: ValidateIsObject = validateIsType('object');

/**
 * Does the object have the given key?
 */
type ValidateObjHasKey = string => Validator;
export const validateObjHasKey: ValidateObjHasKey = key =>
  fromPredicate(
    obj => obj.hasOwnProperty(key),
    () => `Missing required field "${key}"`
  );

/**
 * If the given object property exists, does it typecheck?
 */
type ValidateObjPropHasType = string => string => Validator;
export const validateObjPropHasType: ValidateObjPropHasType = type => key => obj => {
  if (!obj.hasOwnProperty(key)) return ok();
  return isType(type)(obj[key])
    ? ok()
    : err([`Field "${key}" failed to typecheck (expected ${type})`]);
};

/**
 * If the given object property exists, does it pass the given validator?
 */
type ValidateObjPropPasses = Validator => string => Validator;
export const validateObjPropPasses: ValidateObjPropPasses = v => key => obj => {
  if (!obj.hasOwnProperty(key)) return ok();
  return prefixErrors(`At field "${key}": `)(v(obj[key]));
};

/**
 * Does the object have any fields not present in the schema?
 */
type ValidateObjOnlyHasKeys = (Array<string>) => Validator;
export const validateObjOnlyHasKeys: ValidateObjOnlyHasKeys = keys => obj =>
  toResult(
    Object.keys(obj)
      .filter(k => !keys.includes(k))
      .map(k => `Extra field "${k}"`)
  );

/**
 * Is the given data an array?
 */
type ValidateIsArray = Validator;
export const validateIsArray: ValidateIsArray = validateIsType('array');

/**
 * Does each array item typecheck?
 */
type ValidateArrayItemsHaveType = string => Validator;
export const validateArrayItemsHaveType: ValidateArrayItemsHaveType = type => arr =>
  prefixErrors(`Item `)(flattenResults(arr.map(validateIsType(type))));

/**
 * Does each array item pass the given validator?
 */
type ValidateArrayItemsPass = Validator => Validator;
export const validateArrayItemsPass: ValidateArrayItemsPass = v => arr =>
  flattenResults(
    arr.map(v).map((res, i) => prefixErrors(`At item ${i}: `)(res))
  );
