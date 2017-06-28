'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateAsArraySchema = exports.validateAsObjectSchema = exports.processSchemaError = undefined;

var _compose = require('./compose');

var _validators = require('./validators');

var _result = require('./result');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var validateAsSchemaRules = function validateAsSchemaRules(rules) {
  return (0, _compose.allUntilFailure)([_validators.validateIsObject].concat(_toConsumableArray(Object.keys(rules).filter(function (k) {
    return ['required', 'type', 'validator'].includes(k);
  }).map(function (k) {
    if (k === 'required') return (0, _validators.validateObjPropHasType)('boolean')('required');
    if (k === 'type') return (0, _validators.validateObjPropHasType)('string')('type');
    return (0, _validators.validateObjPropHasType)('function')('validator');
  }))))(rules);
};

var validateAsNestedSchemaRules = function validateAsNestedSchemaRules(field) {
  return function (schema) {
    return validateAsSchemaRules(schema[field]);
  };
};

var processSchemaError = exports.processSchemaError = function processSchemaError(schemaResult) {
  return [(0, _validators.alwaysErr)((0, _result.getErrors)((0, _result.mapErrors)(function (err) {
    return 'Schema error: ' + err;
  })(schemaResult)))];
};

var validateAsObjectSchema = exports.validateAsObjectSchema = function validateAsObjectSchema(schema) {
  return (0, _compose.allUntilFailure)([_validators.validateIsObject].concat(_toConsumableArray(Object.keys(schema).map(function (k) {
    return validateAsNestedSchemaRules(k);
  }))))(schema);
};

var validateAsArraySchema = exports.validateAsArraySchema = function validateAsArraySchema(schema) {
  return (0, _compose.allUntilFailure)([_validators.validateIsObject, validateAsSchemaRules])(schema);
};