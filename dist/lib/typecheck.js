'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isISOString = exports.isISOString = function isISOString(str) {
  return typeof str === 'string' && str.match(/^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i) !== null;
};

/**
 * Is the parameter a valid date object or string?
 */


/**
 * Is the parameter a valid ISO 8601 date string?
 *
 * Ref: http://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
 */
var isDate = exports.isDate = function isDate(val) {
  return val instanceof Date || isISOString(val);
};

/**
 * Is the parameter a non-array, non-date object?
 */
var isObject = exports.isObject = function isObject(val) {
  return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && !isArray(val) && !isDate(val);
};

/**
 * Is the parameter an array?
 */
var isArray = exports.isArray = function isArray(arr) {
  return Array.isArray(arr);
};

/**
 * Is the parameter null?
 */
var isNull = exports.isNull = function isNull(val) {
  return val === null;
};

/**
 * Does the given value match the given type?
 */
var isType = exports.isType = function isType(type) {
  return function (val) {
    switch (type) {
      case 'array':
        return isArray(val);
      case 'date':
        return isDate(val);
      case 'object':
        return isObject(val);
      case 'null':
        return isNull(val);
      default:
        return (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === type;
    }
  };
};