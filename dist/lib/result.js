"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});


// Constructors


// Types
var ok = exports.ok = function ok() {
  return { valid: true, errors: [] };
};

var err = exports.err = function err(errs) {
  return {
    valid: false,
    errors: errs
  };
};

// Helpers
var isOK = exports.isOK = function isOK(r) {
  return r.valid;
};

var isErr = exports.isErr = function isErr(r) {
  return !r.valid;
};

var toResult = exports.toResult = function toResult(errs) {
  return errs.length === 0 ? ok() : err(errs);
};