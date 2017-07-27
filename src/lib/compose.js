// @flow

import { isOK, ok, isErr, err, flattenResults } from './result';
import type { Result } from './result';
import type { Validator, Data } from './validators';

/**
 * Types
 */
type Composer = (Array<Validator>) => Data => Result;

/**
 * Run a series of validators (left-to-right) such that all of the
 * validators must succeed. Otherwise, returns the first set of errors
 */
export const allWhileOK: Composer = validators => data =>
  validators.reduce((res, v) => (isOK(res) ? v(data) : res), ok());

/**
 * Run a series of validators such that all of the validators
 * must succeed. Otherwise, returns all of the errors
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
    return isErr(vRes) ? flattenResults([res, vRes]) : vRes;
  }, err());
