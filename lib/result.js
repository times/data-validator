/**
 * Result = OK | Err
 */

class OK {
  constructor() {
    this.valid = true;
    this.errors = [];
  }
}

class Err {
  constructor(errors) {
    this.valid = false;
    this.errors = errors;
  }
}

// Save writing `new` everywhere
const ok = () => new OK();
const err = errs => new Err(errs);

// Helpers
const isOK = r => r instanceof OK;
const isErr = r => r instanceof Err;

const toResult = function() {
  return this.length === 0 ? ok() : err(this);
};

module.exports = {
  OK,
  Err,
  ok,
  err,
  isOK,
  isErr,
  toResult,
};
