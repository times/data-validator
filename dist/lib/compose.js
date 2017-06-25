'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fromObjectSchema = exports.some = exports.all = undefined;

var _result = require('./result');

var _helpers = require('./helpers');

var _validators = require('./validators');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Run a series of validators (left-to-right) such that all of the
 * validators must succeed. Otherwise, returns the first set of errors
 */


/**
 * Types
 */
var all = exports.all = function all(validators) {
  return function (data) {
    return validators.reduce(function (res, v) {
      return (0, _result.isOK)(res) ? v(data) : res;
    }, (0, _result.ok)());
  };
};

/**
 * Run a series of validators such that at least one of the validators must
 * succeed. Otherwise, returns all of the errors
 */
var some = exports.some = function some(validators) {
  return function (data) {
    return validators.reduce(function (res, v) {
      if ((0, _result.isOK)(res)) return res;
      var vRes = v(data);
      return (0, _result.isErr)(vRes) ? (0, _result.err)([].concat(_toConsumableArray(res.errors), _toConsumableArray(vRes.errors))) : vRes;
    }, (0, _result.err)([]));
  };
};

/**
 * Convert a schema to an array of validators
 */
var fromObjectSchema = exports.fromObjectSchema = function fromObjectSchema() {
  var schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var defaultVs = [_validators.validateIsObject];

  if (!(0, _helpers.isObject)(schema)) return defaultVs;

  return Object.keys(schema).reduce(function (vs, k) {
    var rules = schema[k];

    var extraVs = [];
    if (rules.required === true) extraVs = [].concat(_toConsumableArray(extraVs), [(0, _validators.validateObjHasKey)(k)]);
    if (rules.type) extraVs = [].concat(_toConsumableArray(extraVs), [(0, _validators.validateObjPropHasType)(rules.type)(k)]);
    if (rules.validator) extraVs = [].concat(_toConsumableArray(extraVs), [(0, _validators.validateObjPropPasses)(rules.validator)(k)]);

    return [].concat(_toConsumableArray(vs), _toConsumableArray(extraVs));
  }, defaultVs);
};

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