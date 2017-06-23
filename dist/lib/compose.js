'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.testSome = exports.testAll = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _result = require('./result');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Functions


// Types
var isArray = function isArray(data) {
  return Array.isArray(data) ? (0, _result.ok)() : (0, _result.err)(['not array']);
};

var isObject = function isObject(data) {
  return (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' ? (0, _result.ok)() : (0, _result.err)(['not object']);
};

// const compose: Validator = (run: Runner) => (vs: Array<Validator>) => (
//   data: Data
// ) => {
//   return run(vs)(data);
// };

var compose = function compose(run) {
  return function () {
    for (var _len = arguments.length, validators = Array(_len), _key = 0; _key < _len; _key++) {
      validators[_key] = arguments[_key];
    }

    return function (data) {
      return run.apply(undefined, validators)(data);
    };
  };
};

// all :: [val] -> data -> Result
var all = function all() {
  for (var _len2 = arguments.length, validators = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    validators[_key2] = arguments[_key2];
  }

  return function (data) {
    return validators.reduce(function (res, v) {
      return (0, _result.isOK)(res) ? v(data) : res;
    }, (0, _result.ok)());
  };
};

// some :: [val] -> data -> Result
var some = function some() {
  for (var _len3 = arguments.length, validators = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    validators[_key3] = arguments[_key3];
  }

  return function (data) {
    return validators.reduce(function (res, v) {
      if ((0, _result.isOK)(res)) return res;
      var vRes = v(data);
      return (0, _result.isErr)(vRes) ? (0, _result.err)([].concat(_toConsumableArray(res.errors), _toConsumableArray(vRes.errors))) : vRes;
    }, (0, _result.err)([]));
  };
};

var testAll = exports.testAll = compose(all)(isArray, isObject);
var testSome = exports.testSome = compose(some)(isArray, isObject);

// const all = vs => data => {};

// const all: Runner = (...validators) => data =>
//   validators.reduce((res, v) => (isOK(res) ? v(data) : res), ok());

// val :: data -> Result
// compose :: ([val] -> Result) -> [val] -> val
// all :: [val] -> Result
// some :: [val] -> Result
// convert :: schema -> [val]

// const {
//   validateIsObject,
//   validateIsArray,
//   validateRequiredFields,
//   validateExtraFields,
//   // validateFieldPredicates,
//   // validateArrayPredicates,
//   validateFieldsTypecheck,
//   validateItemsTypecheck,
//   validateFieldSchemaValidators,
//   validateArraySchemaValidator,
// } = require('./validators');

// /**
//  * Composes a series of validators (left-to-right) such that all of the
//  * validators must succeed. Otherwise, returns the first set of errors.
//  * All validators are passed the same schema and data
//  */

// *
//  * Composes a series of validators that are already applied to schemas,
//  * such that at least one of the validators must succeed. Otherwise, returns
//  * all of the errors

// const someOf = (...validatorsWithSchemas) => data =>
// validatorsWithSchemas.reduce((res, v) => {
//   if (isOK(res)) return res;
//   const vRes = v(data);
//   return isErr(vRes) ? err([...res.errors, ...vRes.errors]) : vRes;
// }, err());

// /**
//  * Precomposed validator for objects
//  */
// const objectValidator = allOf(
//   validateIsObject,
//   validateRequiredFields,
//   validateExtraFields,
//   validateFieldsTypecheck,
//   // validateFieldPredicates,
//   validateFieldSchemaValidators
// );

// /**
//  * Precomposed validator for arrays
//  */
// const arrayValidator = allOf(
//   validateIsArray,
//   validateItemsTypecheck,
//   // validateArrayPredicates,
//   validateArraySchemaValidator
// );

// module.exports = {
//   allOf,
//   someOf,
//   objectValidator,
//   arrayValidator,
// };