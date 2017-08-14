'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateArrayItemsPass = exports.validateArrayItemsHaveType = exports.validateIsArray = exports.validateObjOnlyHasKeys = exports.validateObjPropPasses = exports.validateObjPropHasType = exports.validateObjHasKey = exports.validateIsObject = exports.validateIsIn = exports.validateIsType = exports.fromPredicate = exports.alwaysOK = exports.alwaysErr = undefined;

var _typecheck = require('./typecheck');

var _result = require('./result');

/**
 * Types
 */


/**
 * Always an error
 */
var alwaysErr = exports.alwaysErr = function alwaysErr(errs) {
  return function () {
    return (0, _result.err)(errs);
  };
};

/**
 * Always OK
 */
var alwaysOK = exports.alwaysOK = function alwaysOK() {
  return function () {
    return (0, _result.ok)();
  };
};

/**
 * Construct a validator from a boolean function
 */
var fromPredicate = exports.fromPredicate = function fromPredicate(test, toErrMsg) {
  return function (data) {
    return test(data) ? (0, _result.ok)() : (0, _result.err)([toErrMsg(data)]);
  };
};

/**
 * Is the given object of the given type?
 */
var validateIsType = exports.validateIsType = function validateIsType(type) {
  return fromPredicate((0, _typecheck.isType)(type), function (data) {
    return '"' + data + '" failed to typecheck (expected ' + type + ')';
  });
};

/**
 * Is the given value in the given array of values?
 */
var validateIsIn = exports.validateIsIn = function validateIsIn(values) {
  return fromPredicate(function (val) {
    return values.includes(val);
  }, function (val) {
    return 'Value must be one of ' + values.join(', ') + ' (got "' + val + '")';
  });
};

/**
 * Is the given data an object?
 */
var validateIsObject = exports.validateIsObject = validateIsType('object');

/**
 * Does the object have the given key?
 */
var validateObjHasKey = exports.validateObjHasKey = function validateObjHasKey(key) {
  return fromPredicate(function (obj) {
    return obj.hasOwnProperty(key);
  }, function () {
    return 'Missing required field "' + key + '"';
  });
};

/**
 * If the given object property exists, does it typecheck?
 */
var validateObjPropHasType = exports.validateObjPropHasType = function validateObjPropHasType(type) {
  return function (key) {
    return function (obj) {
      if (!obj.hasOwnProperty(key)) return (0, _result.ok)();
      return (0, _typecheck.isType)(type)(obj[key]) ? (0, _result.ok)() : (0, _result.err)(['Field "' + key + '" failed to typecheck (expected ' + type + ')']);
    };
  };
};

/**
 * If the given object property exists, does it pass the given validator?
 */
var validateObjPropPasses = exports.validateObjPropPasses = function validateObjPropPasses(v) {
  return function (key) {
    return function (obj) {
      if (!obj.hasOwnProperty(key)) return (0, _result.ok)();
      return (0, _result.prefixErrors)('At field "' + key + '": ')(v(obj[key]));
    };
  };
};

/**
 * Does the object have any fields not present in the schema?
 */
var validateObjOnlyHasKeys = exports.validateObjOnlyHasKeys = function validateObjOnlyHasKeys(keys) {
  return function (obj) {
    return (0, _result.toResult)(Object.keys(obj).filter(function (k) {
      return !keys.includes(k);
    }).map(function (k) {
      return 'Extra field "' + k + '"';
    }));
  };
};

/**
 * Is the given data an array?
 */
var validateIsArray = exports.validateIsArray = validateIsType('array');

/**
 * Does each array item typecheck?
 */
var validateArrayItemsHaveType = exports.validateArrayItemsHaveType = function validateArrayItemsHaveType(type) {
  return function (arr) {
    return (0, _result.prefixErrors)('Item ')((0, _result.flattenResults)(arr.map(validateIsType(type))));
  };
};

/**
 * Does each array item pass the given validator?
 */
var validateArrayItemsPass = exports.validateArrayItemsPass = function validateArrayItemsPass(v) {
  return function (arr) {
    return (0, _result.flattenResults)(arr.map(v).map(function (res, i) {
      return (0, _result.prefixErrors)('At item ' + i + ': ')(res);
    }));
  };
};