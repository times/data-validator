'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.alwaysOK = exports.alwaysErr = exports.validateArrayItemsPass = exports.validateArrayItemsHaveType = exports.validateIsArray = exports.validateObjOnlyHasKeys = exports.validateObjPropPasses = exports.validateObjPropHasType = exports.validateObjHasKey = exports.validateIsObject = undefined;

var _typecheck = require('./typecheck');

var _result = require('./result');

/**
 * Types
 */


/**
 * Is the given data an object?
 */
var validateIsObject = exports.validateIsObject = function validateIsObject(data) {
  return (0, _typecheck.isObject)(data) ? (0, _result.ok)() : (0, _result.err)(['Data was not an object']);
};

/**
 * Does the object have the given key?
 */
var validateObjHasKey = exports.validateObjHasKey = function validateObjHasKey(key) {
  return function (obj) {
    return obj.hasOwnProperty(key) ? (0, _result.ok)() : (0, _result.err)(['Missing required field "' + key + '"']);
  };
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
      return (0, _result.mapErrors)(function (e) {
        return 'At field "' + key + '": ' + e;
      })(v(obj[key]));
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
var validateIsArray = exports.validateIsArray = function validateIsArray(data) {
  return (0, _typecheck.isArray)(data) ? (0, _result.ok)() : (0, _result.err)(['Data was not an array']);
};

/**
 * Does each array item typecheck?
 */
var validateArrayItemsHaveType = exports.validateArrayItemsHaveType = function validateArrayItemsHaveType(type) {
  return function (arr) {
    return (0, _result.toResult)(arr.filter(function (a) {
      return !(0, _typecheck.isType)(type)(a);
    }).map(function (a) {
      return 'Item "' + a + '" failed to typecheck (expected ' + type + ')';
    }));
  };
};

/**
 * Does each array item pass the given validator?
 */
var validateArrayItemsPass = exports.validateArrayItemsPass = function validateArrayItemsPass(v) {
  return function (arr) {
    return (0, _result.flattenResults)(arr.map(v).map(function (res, i) {
      return (0, _result.mapErrors)(function (e) {
        return 'At item ' + i + ': ' + e;
      })(res);
    }));
  };
};

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