// @flow
import { concat, flatten, map, mapObjIndexed as mapObj, values } from 'ramda';

import type { Result, Errors } from './result';

// Verbose
type PrintVerboseHelper = boolean => Result => Errors;
const printVerboseHelper: PrintVerboseHelper = isNested => ast => {
  if (ast.valid) return [];

  const { items = {}, errors, type } = ast;

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

type PrintVerbose = Result => Errors;
export const printVerbose: PrintVerbose = printVerboseHelper(false);

// Retrieve errors from a result
type GetErrors = Result => Errors;
export const getErrors: GetErrors = printVerbose;
