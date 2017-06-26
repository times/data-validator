// @flow

import { isOK, ok, isErr, err } from './result';
import type { Result } from './result';

import { isObject } from './helpers';

import {
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateObjPropPasses,
  validateObjOnlyHasKeys,
  validateIsArray,
  validateArrayItemsHaveType,
  validateArrayItemsPass,
} from './validators';
import type { Validator, Data } from './validators';

/**
 * Types
 */
type SchemaRules = {
  required?: boolean,
  type?: string,
  validator?: Validator,
};

type ArraySchema = SchemaRules;
type ObjectSchema = { [key: string]: SchemaRules };

type Composer = Array<Validator> => (Data) => Result;

/**
 * Run a series of validators (left-to-right) such that all of the
 * validators must succeed. Otherwise, returns the first set of errors
 */
export const all: Composer = validators => data =>
  validators.reduce((res, v) => (isOK(res) ? v(data) : res), ok());

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
const flatten: Flatten = (acc, vs) => [...acc, ...vs];

/**
 * Convert an object schema to an array of validators
 */
type FromObjectSchema = ObjectSchema => Array<Validator>;
export const fromObjectSchema: FromObjectSchema = (schema = {}) => {
  const defaultVs = [validateIsObject];

  if (!isObject(schema)) return defaultVs;

  return Object.keys(schema)
    .map(k => {
      const rules = schema[k];

      return Object.keys(rules)
        .map(r => {
          if (r === 'required' && rules[r]) {
            return rules[r] === true ? [validateObjHasKey(k)] : [];
          } else if (r === 'type' && rules[r]) {
            return [validateObjPropHasType(rules[r])(k)];
          } else if (r === 'validator' && rules[r]) {
            return [validateObjPropPasses(rules[r])(k)];
          } else return [];
        })
        .reduce(flatten, []);
    })
    .reduce(flatten, defaultVs);
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
  const defaultVs = [validateIsArray];

  if (!isObject(schema)) return defaultVs;

  return Object.keys(schema)
    .map(k => {
      if (k === 'type' && schema[k]) {
        return [validateArrayItemsHaveType(schema[k])];
      } else if (k === 'validator' && schema[k]) {
        return [validateArrayItemsPass(schema[k])];
      } else return [];
    })
    .reduce(flatten, defaultVs);
};

/**
 * Precomposed helper for objects
 */
type ObjectValidator = ObjectSchema => Validator;
export const objectValidator: ObjectValidator = schema =>
  all(fromObjectSchemaStrict(schema));

/**
 * Precomposed helper for arrays
 */
type ArrayValidator = ArraySchema => Validator;
export const arrayValidator: ArrayValidator = schema =>
  all(fromArraySchema(schema));
