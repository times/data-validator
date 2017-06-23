'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _compose = require('./lib/compose');

Object.keys(_compose).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _compose[key];
    }
  });
});

var _result = require('./lib/result');

Object.keys(_result).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _result[key];
    }
  });
});