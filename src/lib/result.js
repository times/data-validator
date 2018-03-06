// @flow
import { addIndex, concat, map, merge, mergeWith, reduce } from 'ramda';

/**
 * Types
 */
export type Errors = Array<string>;

type OK = {| valid: true |};

type Err = {|
  valid: false,
  errors: Errors,
  type?: string,
  items?: {
    [string]: Result
  }
|};

export type Result = OK | Err;

/**
 * Constructors
 */
type _ok = () => OK;
export const ok: _ok = () => ({ valid: true });

type _err = (errors?: Errors) => Result;
export const err: _err = (errors = []) => ({ valid: false, errors });

/**
 * Helpers
 */
type IsOK = Result => boolean;
export const isOK: IsOK = ({ valid }) => valid !== undefined && valid;

type IsErr = Result => boolean;
export const isErr: IsErr = ({ valid }) => valid !== undefined && !valid;

// Apply a function to every error in a Result
type MapErrors = ((string, ?number) => string) => Result => Result;
export const mapErrors: MapErrors = f => r => {
  if (r.valid) return r;

  const withMappedErrors = {
    valid: false,
    errors: addIndex(map)(f, r.errors)
  };

  return r.items
    ? merge(withMappedErrors, { items: map(mapErrors(f), r.items) })
    : withMappedErrors;
};

// Prefix every error in a Result with the given string
type PrefixErrors = string => Result => Result;
export const prefixErrors: PrefixErrors = prefix =>
  mapErrors(e => `${prefix}${e}`);

// Combine two results
type MergeResults = (Result, Result) => Result;
export const mergeResults: MergeResults = (r1, r2) => {
  if (r1.valid) return r2;
  if (r2.valid) return r1;

  const r1Items = r1.items || {};
  const r2Items = r2.items || {};

  // Otherwise merge errors
  return {
    valid: false,
    errors: concat(r1.errors, r2.errors), // intersection?
    type: r1.type,
    items: mergeWith(mergeResults, r1Items, r2Items)
  };
};

type ConcatResults = (Array<Result>) => Result;
export const concatResults: ConcatResults = reduce(mergeResults, ok());
