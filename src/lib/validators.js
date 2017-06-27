// @flow

import { isObject, isArray, isType } from './helpers';

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
  isObject(data) ? ok() : err([`Data was not an object`]);

/**
 * Does the object have the given key?
 */
type ValidateObjHasKey = string => Validator;
export const validateObjHasKey: ValidateObjHasKey = key => obj =>
  obj.hasOwnProperty(key) ? ok() : err([`Missing required field "${key}"`]);

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
  return mapErrors(e => `At field "${key}": ${e}`)(v(obj[key]));
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
export const validateIsArray: ValidateIsArray = data =>
  isArray(data) ? ok() : err([`Data was not an array`]);

/**
 * Does each array item typecheck?
 */
type ValidateArrayItemsHaveType = string => Validator;
export const validateArrayItemsHaveType: ValidateArrayItemsHaveType = type => arr =>
  toResult(
    arr
      .filter(a => !isType(type)(a))
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
 * Always an error
 */
type AlwaysErr = Errors => Validator;
export const alwaysErr: AlwaysErr = errs => () => err(errs);

/**
 * Always an ok
 */
type AlwaysOK = () => Validator;
export const alwaysOk: AlwaysOK = () => () => ok();
