'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayValidator = exports.objectValidator = exports.fromArraySchema = exports.fromObjectSchemaStrict = exports.fromObjectSchema = exports.some = exports.all = undefined;

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

// Helper

var flatten = function flatten(acc, vs) {
  return [].concat(_toConsumableArray(acc), _toConsumableArray(vs));
};

/**
 * Convert an object schema to an array of validators
 */
var fromObjectSchema = exports.fromObjectSchema = function fromObjectSchema() {
  var schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var defaultVs = [_validators.validateIsObject];

  if (!(0, _helpers.isObject)(schema)) return defaultVs;

  return Object.keys(schema).map(function (k) {
    var rules = schema[k];

    return Object.keys(rules).map(function (r) {
      if (r === 'required' && rules[r]) {
        return rules[r] === true ? [(0, _validators.validateObjHasKey)(k)] : [];
      } else if (r === 'type' && rules[r]) {
        return [(0, _validators.validateObjPropHasType)(rules[r])(k)];
      } else if (r === 'validator' && rules[r]) {
        return [(0, _validators.validateObjPropPasses)(rules[r])(k)];
      } else return [];
    }).reduce(flatten, []);
  }).reduce(flatten, defaultVs);
};

/**
 * Convert an object schema to an array of validators and forbid extra fields
 */
var fromObjectSchemaStrict = exports.fromObjectSchemaStrict = function fromObjectSchemaStrict() {
  var schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var vs = fromObjectSchema(schema);
  return (0, _helpers.isObject)(schema) ? [].concat(_toConsumableArray(vs), [(0, _validators.validateObjOnlyHasKeys)(Object.keys(schema))]) : vs;
};

/**
 * Convert an array schema to an array of validators
 */
var fromArraySchema = exports.fromArraySchema = function fromArraySchema() {
  var schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var defaultVs = [_validators.validateIsArray];

  if (!(0, _helpers.isObject)(schema)) return defaultVs;

  return Object.keys(schema).map(function (k) {
    if (k === 'type' && schema[k]) {
      return [(0, _validators.validateArrayItemsHaveType)(schema[k])];
    } else if (k === 'validator' && schema[k]) {
      return [(0, _validators.validateArrayItemsPass)(schema[k])];
    } else return [];
  }).reduce(flatten, defaultVs);
};

/**
 * Precomposed helper for objects
 */
var objectValidator = exports.objectValidator = function objectValidator(schema) {
  return all(fromObjectSchemaStrict(schema));
};

/**
 * Precomposed helper for arrays
 */
var arrayValidator = exports.arrayValidator = function arrayValidator(schema) {
  return all(fromArraySchema(schema));
};