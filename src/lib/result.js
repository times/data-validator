// @flow

/**
 * Types
 */
export type Errors = Array<string>;

type OK = { valid: true, errors: [] };
type Err = { valid: false, errors: Errors };

export type Result = OK | Err;

/**
 * Constructors
 */
type _ok = () => OK;
export const ok: _ok = () => ({ valid: true, errors: [] });

type _err = (errs?: Errors) => Err;
export const err: _err = (errs = []) => ({ valid: false, errors: errs });

/**
 * Helpers
 */
type IsOK = Result => boolean;
export const isOK: IsOK = r => r.valid === true;

type IsErr = Result => boolean;
export const isErr: IsErr = r => r.valid === false;

// Convert a (possibly empty) array of errors into a Result
type ToResult = Errors => Result;
export const toResult: ToResult = errs =>
  errs.length === 0 ? ok() : err(errs);

// Apply a function to every error in a Result
type MapErrors = ((string) => string) => Result => Result;
export const mapErrors: MapErrors = f => r => toResult(r.errors.map(f));

// Flatten an array of Results into a single Result
type FlattenResults = (Array<Result>) => Result;
export const flattenResults: FlattenResults = results =>
  results.reduce((acc, r) => toResult([...acc.errors, ...r.errors]), ok());

// Get the errors from a result
type GetErrors = Result => Errors;
export const getErrors: GetErrors = (result: Result) =>
  isErr(result) ? [...result.errors] : [];
