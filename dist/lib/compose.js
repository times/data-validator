'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.some = exports.all = exports.allWhileOK = undefined;

var _result = require('./result');

/**
 * Run a series of validators (left-to-right) such that all of the
 * validators must succeed. Otherwise, returns the first set of errors
 */


/**
 * Types
 */
var allWhileOK = exports.allWhileOK = function allWhileOK(validators) {
  return function (data) {
    return validators.reduce(function (res, v) {
      return (0, _result.isOK)(res) ? v(data) : res;
    }, (0, _result.ok)());
  };
};

/**
 * Run a series of validators such that all of the validators
 * must succeed. Otherwise, returns all of the errors
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
      return (0, _result.isErr)(vRes) ? (0, _result.flattenResults)([res, vRes]) : vRes;
    }, (0, _result.err)());
  };
};