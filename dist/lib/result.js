"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var ok = exports.ok = function ok() {
  return { valid: true, errors: [] };
};

/**
 * Constructors
 */


/**
 * Types
 */
var err = exports.err = function err() {
  var errs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  return { valid: false, errors: errs };
};

/**
 * Helpers
 */
var isOK = exports.isOK = function isOK(r) {
  return r.valid === true;
};

var isErr = exports.isErr = function isErr(r) {
  return r.valid === false;
};

// Convert a (possibly empty) array of errors into a Result
var toResult = exports.toResult = function toResult(errs) {
  return errs.length === 0 ? ok() : err(errs);
};

// Apply a function to every error in a Result
var mapErrors = exports.mapErrors = function mapErrors(f) {
  return function (r) {
    return toResult(r.errors.map(f));
  };
};

// Prefix every error in a Result with the given string
var prefixErrors = exports.prefixErrors = function prefixErrors(prefix) {
  return mapErrors(function (e) {
    return "" + prefix + e;
  });
};

// Flatten an array of Results into a single Result
var flattenResults = exports.flattenResults = function flattenResults(results) {
  return results.reduce(function (acc, r) {
    return toResult([].concat(_toConsumableArray(acc.errors), _toConsumableArray(r.errors)));
  }, ok());
};

// Get the errors from a result
var getErrors = exports.getErrors = function getErrors(result) {
  return isErr(result) ? [].concat(_toConsumableArray(result.errors)) : [];
};