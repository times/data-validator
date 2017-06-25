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

type _err = Errors => Err;
export const err: _err = (errs = []) => ({ valid: false, errors: errs });

/**
 * Helpers
 */
type IsOK = Result => boolean;
export const isOK: IsOK = r => r.valid === true;

type IsErr = Result => boolean;
export const isErr: IsErr = r => r.valid === false;

type ToResult = Errors => Result;
export const toResult: ToResult = errs =>
  (errs.length === 0 ? ok() : err(errs));

type MapErrors = ((string) => string) => (Result) => Result;
export const mapErrors: MapErrors = f => r => toResult(r.errors.map(f));
