// @flow
import { map, reduce } from 'ramda';

import { isOK, ok, isErr, err, concatResults, mergeResults } from './result';
import type { Result } from './result';
import type { Validator, Data } from './validators';

/**
 * A Composer accepts an array of Validators and applies some Data to each of
 * them in turn according to its particular logic, returning a single Result
 */
type Composer = (Array<Validator>) => Data => Result;

/**
 * Runs an array of validators in order until one of them returns an Err.
 * If all of the validators succeed, returns an OK
 */
export const allWhileOK: Composer = validators => data =>
  reduce((res, v) => (isOK(res) ? v(data) : res), ok())(validators);

/**
 * Runs all the validators in an array, returning their combined Errs. If all
 * of the validators succeed, returns an OK
 */
export const all: Composer = validators => data =>
  concatResults(map(v => v(data), validators));

/**
 * Runs all the validators in an array until one of them returns an OK. If all
 * of the validators fail, returns their combined Errs
 */
export const some: Composer = validators => data =>
  reduce((res, v) => {
    if (isOK(res)) return res;
    const vRes = v(data);
    return isErr(vRes) ? mergeResults(res, vRes) : vRes;
  }, err())(validators);
