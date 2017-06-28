'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayValidator = exports.objectValidator = exports.fromArraySchema = exports.fromObjectSchemaStrict = exports.fromObjectSchema = exports.flatten = exports.some = exports.all = exports.allUntilFailure = undefined;

var _result = require('./result');

var _helpers = require('./helpers');

var _internal = require('./internal');

var _validators = require('./validators');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Run a series of validators (left-to-right) such that all of the
 * validators must succeed. Otherwise, returns the first set of errors
 */


/**
 * Types
 */
var allUntilFailure = exports.allUntilFailure = function allUntilFailure(validators) {
  return function (data) {
    return validators.reduce(function (res, v) {
      return (0, _result.isOK)(res) ? v(data) : res;
    }, (0, _result.ok)());
  };
};

/**
 * Run a series of validators (left-to-right) such that all of the
 * validators must succeed. Otherwise, return all of the errors
 */
var all = exports.all = function all(validators) {
  return function (data) {
    return (0, _result.flattenResults)(validators.map(function (v) {
      return v(data);
    }));
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
var flatten = exports.flatten = function flatten(acc, vs) {
  return [].concat(_toConsumableArray(acc), _toConsumableArray(vs));
};

/**
 * Convert an object schema to an array of validators
 */
var fromObjectSchema = exports.fromObjectSchema = function fromObjectSchema() {
  var schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!(0, _helpers.isObject)(schema)) return (0, _internal.processSchemaError)((0, _result.err)(['Schemas must be objects']));

  var schemaResult = (0, _internal.validateAsObjectSchema)(schema);
  if ((0, _result.isErr)(schemaResult)) return (0, _internal.processSchemaError)(schemaResult);

  var requiredChecks = Object.keys(schema).map(function (k) {
    return schema[k].required ? (0, _validators.validateObjHasKey)(k) : (0, _validators.alwaysOk)();
  });
  var typeChecks = Object.keys(schema).map(function (k) {
    return schema[k].type ? (0, _validators.validateObjPropHasType)(schema[k].type)(k) : (0, _validators.alwaysOk)();
  });
  var validatorChecks = Object.keys(schema).map(function (k) {
    return schema[k].validator ? (0, _validators.validateObjPropPasses)(schema[k].validator)(k) : (0, _validators.alwaysOk)();
  });

  return [_validators.validateIsObject, all(requiredChecks), all(typeChecks), all(validatorChecks)];
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

  if (!(0, _helpers.isObject)(schema)) return (0, _internal.processSchemaError)((0, _result.err)(['Schemas must be objects']));

  var schemaResult = (0, _internal.validateAsArraySchema)(schema);
  if ((0, _result.isErr)(schemaResult)) return (0, _internal.processSchemaError)(schemaResult);

  return Object.keys(schema).map(function (k) {
    if (k === 'type' && schema[k]) {
      return [(0, _validators.validateArrayItemsHaveType)(schema[k])];
    } else if (k === 'validator' && schema[k]) {
      return [(0, _validators.validateArrayItemsPass)(schema[k])];
    } else return [];
  }).reduce(flatten, [_validators.validateIsArray]);
};

/**
 * Precomposed helper for objects
 */
var objectValidator = exports.objectValidator = function objectValidator(schema) {
  return allUntilFailure(fromObjectSchemaStrict(schema));
};

/**
 * Precomposed helper for arrays
 */
var arrayValidator = exports.arrayValidator = function arrayValidator(schema) {
  return allUntilFailure(fromArraySchema(schema));
};