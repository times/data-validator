// @flow
import {
  mapObjIndexed as mapObj,
  map,
  reduce,
  flatten,
  concat,
  values,
  mergeWith
} from 'ramda';

type Error = string;
type Errors = Array<Error>;

type Ok = { valid: true };

type Err = {|
  valid: false,
  value: mixed,
  errors: Errors,
  type?: string,
  items?: {
    [string]: Result
  }
|};

type Result = Ok | Err;

type Validator = any => Result;

// Helpers
type _ok = () => Result;
export const ok: _ok = () => ({ valid: true });

type _err = (mixed, Error) => Result;
export const err: _err = (value, error) => ({
  valid: false,
  value,
  errors: [error]
});

type IsOK = Result => boolean;
export const isOK: IsOK = ({ valid }) => valid;

type IsErr = Result => boolean;
export const isErr: IsErr = ({ valid }) => !valid;

type MergeResults = (Result, Result) => Result;
export const mergeResults: MergeResults = (r1, r2) => {
  if (r1.valid) return r2;
  if (r2.valid) return r1;

  const r1Items = r1.items || {};
  const r2Items = r2.items || {};

  // Otherwise merge errors
  return {
    valid: false,
    value: r1.value,
    errors: concat(r1.errors, r2.errors), // intersection?
    type: r1.type,
    items: mergeWith(mergeResults, r1Items, r2Items)
  };
};

type ConcatResults = (Array<Result>) => Result;
export const concatResults: ConcatResults = reduce(mergeResults, ok());

// Apply a function to every error in a Result
type MapErrors = ((string) => string) => Result => Result;
export const mapErrors: MapErrors = f => r => {
  if (r.valid) return r;

  const mappedErrors = map(f, r.errors);

  return r.items
    ? {
        ...r,
        errors: mappedErrors,
        items: map(mapErrors(f), r.items)
      }
    : {
        ...r,
        errors: mappedErrors
      };
};

// Composers
type Composer = (Array<Validator>) => any => Result;

export const allWhileOK: Composer = validators => data =>
  reduce((res, v) => (isOK(res) ? v(data) : res), ok())(validators);

export const all: Composer = validators => data =>
  concatResults(map(v => v(data), validators));

// Validators
export const valStrLen: Validator = s =>
  s.length > 5 ? ok() : err(s, 'Length < 5');

export const valStrStartsWith: string => Validator = c => s =>
  s.charAt(0) === c ? ok() : err(s, `Expected ${c} (got ${s.charAt(0)})`);

export const valStr: Validator = allWhileOK([valStrLen, valStrStartsWith('A')]);

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
        : type === 'object' ? `${at} field ${key}: ` : ``;

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

// Retrieve errors
type GetErrors = Result => Errors;
export const getErrors: GetErrors = printVerbose;
