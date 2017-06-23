// @flow

// Types
export type Errors = Array<string>;

type OK = { valid: true, errors: [] };

type Err = { valid: false, errors: Errors };

export type Result = OK | Err;

// Constructors
export const ok = (): OK => ({ valid: true, errors: [] });

export const err = (errs: Errors): Err => ({
  valid: false,
  errors: errs,
});

// Helpers
export const isOK = (r: Result) => r.valid;

export const isErr = (r: Result) => !r.valid;

export const toResult = (errs: Errors) =>
  (errs.length === 0 ? ok() : err(errs));
