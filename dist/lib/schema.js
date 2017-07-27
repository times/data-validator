'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayValidator = exports.objectValidator = exports.fromArraySchema = exports.fromObjectSchemaStrict = exports.fromObjectSchema = exports.validateAsArraySchema = exports.validateAsObjectSchema = undefined;

var _validators = require('./validators');

var _compose = require('./compose');

var _result = require('./result');

var _typecheck = require('./typecheck');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Types
 */


/**
 * Convert a schema rule to a validator
 */
var convertSchemaRuleToValidator = function convertSchemaRuleToValidator(key) {
  switch (key) {
    case 'required':
      return (0, _validators.validateObjPropHasType)('boolean')('required');
    case 'type':
      return (0, _validators.validateObjPropHasType)('string')('type');
    case 'validator':
      return (0, _validators.validateObjPropHasType)('function')('validator');
    default:
      return (0, _validators.alwaysOK)();
  }
};

/**
 * Validates a set of schema rules as valid
 */

var validateAsSchemaRules = function validateAsSchemaRules(rules) {
  var ruleValidators = Object.keys(rules).map(convertSchemaRuleToValidator);
  return (0, _compose.allWhileOK)([_validators.validateIsObject].concat(_toConsumableArray(ruleValidators)))(rules);
};

/**
 * Validates a segment of an object schema as a valid set of schema rules
 */

var validateAsNestedSchemaRules = function validateAsNestedSchemaRules(field) {
  return function (schema) {
    return validateAsSchemaRules(schema[field]);
  };
};

/**
 * Enforces a failed validation if the schema is invalid
 */

var processSchemaError = function processSchemaError(schemaResult) {
  return [(0, _validators.alwaysErr)((0, _result.getErrors)((0, _result.mapErrors)(function (err) {
    return 'Schema error: ' + err;
  })(schemaResult)))];
};

/**
 * Returns a result, having validated the supplied ObjectSchema
 */
var validateAsObjectSchema = exports.validateAsObjectSchema = function validateAsObjectSchema(schema) {
  return (0, _compose.allWhileOK)([_validators.validateIsObject].concat(_toConsumableArray(Object.keys(schema).map(validateAsNestedSchemaRules))))(schema);
};

/**
 * Returns a result, having validated the supplied ArraySchema
 */
var validateAsArraySchema = exports.validateAsArraySchema = function validateAsArraySchema(schema) {
  return (0, _compose.allWhileOK)([_validators.validateIsObject, validateAsSchemaRules])(schema);
};

/**
 * Convert an object schema to an array of validators
 */
var fromObjectSchema = exports.fromObjectSchema = function fromObjectSchema() {
  var schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!(0, _typecheck.isObject)(schema)) return processSchemaError((0, _result.err)(['Schemas must be objects']));

  var schemaResult = validateAsObjectSchema(schema);
  if ((0, _result.isErr)(schemaResult)) return processSchemaError(schemaResult);

  var requiredChecks = Object.keys(schema).filter(function (k) {
    return schema[k].required;
  }).map(_validators.validateObjHasKey);

  var typeChecks = Object.keys(schema).map(function (k) {
    var type = schema[k].type;
    return type ? (0, _validators.validateObjPropHasType)(type)(k) : null;
  }).filter(Boolean);

  var validatorChecks = Object.keys(schema).map(function (k) {
    var validator = schema[k].validator;
    return validator ? (0, _validators.validateObjPropPasses)(validator)(k) : null;
  }).filter(Boolean);

  return [_validators.validateIsObject, (0, _compose.all)(requiredChecks), (0, _compose.all)(typeChecks), (0, _compose.all)(validatorChecks)];
};

/**
 * Convert an object schema to an array of validators and forbid extra fields
 */
var fromObjectSchemaStrict = exports.fromObjectSchemaStrict = function fromObjectSchemaStrict() {
  var schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var vs = fromObjectSchema(schema);
  return (0, _typecheck.isObject)(schema) ? [].concat(_toConsumableArray(vs), [(0, _validators.validateObjOnlyHasKeys)(Object.keys(schema))]) : vs;
};

/**
 * Convert an array schema to an array of validators
 */
var fromArraySchema = exports.fromArraySchema = function fromArraySchema() {
  var schema = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!(0, _typecheck.isObject)(schema)) return processSchemaError((0, _result.err)(['Schemas must be objects']));

  var schemaResult = validateAsArraySchema(schema);
  if ((0, _result.isErr)(schemaResult)) return processSchemaError(schemaResult);

  var vs = Object.keys(schema).map(function (k) {
    if (k === 'type' && schema[k]) {
      return (0, _validators.validateArrayItemsHaveType)(schema[k]);
    } else if (k === 'validator' && schema[k]) {
      return (0, _validators.validateArrayItemsPass)(schema[k]);
    } else return null;
  }).filter(Boolean);

  return [_validators.validateIsArray].concat(_toConsumableArray(vs));
};

/**
 * Precomposed helper for objects
 */
var objectValidator = exports.objectValidator = function objectValidator(schema) {
  return (0, _compose.allWhileOK)(fromObjectSchemaStrict(schema));
};

/**
 * Precomposed helper for arrays
 */
var arrayValidator = exports.arrayValidator = function arrayValidator(schema) {
  return (0, _compose.allWhileOK)(fromArraySchema(schema));
};