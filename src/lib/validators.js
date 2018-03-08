// @flow
import { addIndex, compose, curry, filter, keys, map } from 'ramda';

import { isType } from './typecheck';
import {
  type Result,
  type Errors,
  ok,
  err,
  isOK,
  concatResults
} from './result';

/**
 * A Validator accepts some data, runs checks against it, and returns a result
 * that is either OK or an Err
 */
export type Data = any;
export type Validator = Data => Result;

// @TODO move these
const buildObjRes = key => res =>
  isOK(res) ? ok() : err([], 'object', { [key]: res });

const buildArrayRes = idx => res =>
  isOK(res) ? ok() : err([], 'array', { [idx]: res });

/**
 * Always returns an Err with the given errors
 */
type AlwaysErr = Errors => Validator;
export const alwaysErr: AlwaysErr = errs => () => err(errs);

/**
 * Always returns OK
 */
type AlwaysOK = () => Validator;
export const alwaysOK: AlwaysOK = () => () => ok();

/**
 * Constructs a validator from a boolean function
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
  const val = obj[key];
  const res = isType(type)(val)
    ? ok()
    : err([`${JSON.stringify(val)} failed to typecheck (expected ${type})`]);

  return buildObjRes(key)(res);
};

/**
 * If the given object property exists, does it pass the given validator?
 */
type ValidateObjPropPasses = Validator => string => Validator;
export const validateObjPropPasses: ValidateObjPropPasses = v => key => obj => {
  if (!obj.hasOwnProperty(key)) return ok();
  return buildObjRes(key)(v(obj[key]));
};

/**
 * Does the object have any fields not present in the schema?
 */
type ValidateObjOnlyHasKeys = (Array<string>) => Validator;
export const validateObjOnlyHasKeys: ValidateObjOnlyHasKeys = requiredKeys =>
  compose(
    concatResults,
    map(k => err([`Extra field "${k}"`])),
    filter(k => !requiredKeys.includes(k)),
    keys
  );

/**
 * Is the given data an array?
 */
type ValidateIsArray = Validator;
export const validateIsArray: ValidateIsArray = validateIsType('array');

/**
 * Does each array item typecheck?
 */
const mapI = curry(addIndex(map));

type ValidateArrayItemsHaveType = string => Validator;
export const validateArrayItemsHaveType: ValidateArrayItemsHaveType = type =>
  compose(
    concatResults,
    mapI((res, i) => buildArrayRes(i)(res)),
    map(validateIsType(type))
  );

/**
 * Does each array item pass the given validator?
 */
type ValidateArrayItemsPass = Validator => Validator;
export const validateArrayItemsPass: ValidateArrayItemsPass = v =>
  compose(concatResults, mapI((res, i) => buildArrayRes(i)(res)), map(v));
