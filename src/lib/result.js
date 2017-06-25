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
export const ok = (): OK => ({ valid: true, errors: [] });

export const err = (errs: Errors): Err => ({
  valid: false,
  errors: errs,
});

/**
 * Helpers
 */
type IsOK = Result => boolean;
export const isOK: IsOK = r => r.valid;

type IsErr = Result => boolean;
export const isErr: IsErr = r => !r.valid;

type ToResult = Errors => Result;
export const toResult: ToResult = errs =>
  (errs.length === 0 ? ok() : err(errs));
