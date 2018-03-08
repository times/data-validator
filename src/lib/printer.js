// @flow
import { concat, flatten, map, mapObjIndexed as mapObj, values } from 'ramda';

import type { Result, Errors } from './result';

/**
 * A Printer accepts a Result and "pretty prints" it, turning it into an array
 * of formatted error messages
 */
type Printer = Result => Errors;

/**
 * Print errors from a Result in a verbose format e.g.
 *
 *  `At item 0: at field "a": 123 failed to typecheck (expected string)`
 */
type PrintVerboseHelper = boolean => Printer;
const printVerboseHelper: PrintVerboseHelper = isNested => result => {
  if (result.valid) return [];

  const { items = {}, errors, type } = result;

  const withPrefix = key => err => {
    const at = isNested ? 'at' : 'At';

    const prefix =
      type === 'array'
        ? `${at} item ${key}: `
        : type === 'object' ? `${at} field "${key}": ` : ``;

    return prefix + err;
  };

  const nestedErrors = mapObj(
    (v, k) => map(withPrefix(k), printVerboseHelper(true)(v)),
    items
  );

  return concat(errors, flatten(values(nestedErrors)));
};

export const printVerbose: Printer = printVerboseHelper(false);

/**
 * Alias of printVerbose
 */
export const getErrors: Printer = printVerbose;
