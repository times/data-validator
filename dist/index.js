'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _compose = require('./lib/compose');

Object.defineProperty(exports, 'all', {
  enumerable: true,
  get: function get() {
    return _compose.all;
  }
});
Object.defineProperty(exports, 'some', {
  enumerable: true,
  get: function get() {
    return _compose.some;
  }
});
Object.defineProperty(exports, 'fromObjectSchema', {
  enumerable: true,
  get: function get() {
    return _compose.fromObjectSchema;
  }
});
Object.defineProperty(exports, 'fromArraySchema', {
  enumerable: true,
  get: function get() {
    return _compose.fromArraySchema;
  }
});
Object.defineProperty(exports, 'objectValidator', {
  enumerable: true,
  get: function get() {
    return _compose.objectValidator;
  }
});
Object.defineProperty(exports, 'arrayValidator', {
  enumerable: true,
  get: function get() {
    return _compose.arrayValidator;
  }
});

var _result = require('./lib/result');

Object.defineProperty(exports, 'ok', {
  enumerable: true,
  get: function get() {
    return _result.ok;
  }
});
Object.defineProperty(exports, 'err', {
  enumerable: true,
  get: function get() {
    return _result.err;
  }
});
Object.defineProperty(exports, 'isOK', {
  enumerable: true,
  get: function get() {
    return _result.isOK;
  }
});
Object.defineProperty(exports, 'isErr', {
  enumerable: true,
  get: function get() {
    return _result.isErr;
  }
});
Object.defineProperty(exports, 'toResult', {
  enumerable: true,
  get: function get() {
    return _result.toResult;
  }
});
Object.defineProperty(exports, 'mapErrors', {
  enumerable: true,
  get: function get() {
    return _result.mapErrors;
  }
});
Object.defineProperty(exports, 'flattenResults', {
  enumerable: true,
  get: function get() {
    return _result.flattenResults;
  }
});