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
Object.defineProperty(exports, 'allWhileOK', {
  enumerable: true,
  get: function get() {
    return _compose.allWhileOK;
  }
});
Object.defineProperty(exports, 'some', {
  enumerable: true,
  get: function get() {
    return _compose.some;
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
Object.defineProperty(exports, 'prefixErrors', {
  enumerable: true,
  get: function get() {
    return _result.prefixErrors;
  }
});
Object.defineProperty(exports, 'flattenResults', {
  enumerable: true,
  get: function get() {
    return _result.flattenResults;
  }
});
Object.defineProperty(exports, 'getErrors', {
  enumerable: true,
  get: function get() {
    return _result.getErrors;
  }
});

var _schema = require('./lib/schema');

Object.defineProperty(exports, 'validateAsObjectSchema', {
  enumerable: true,
  get: function get() {
    return _schema.validateAsObjectSchema;
  }
});
Object.defineProperty(exports, 'validateAsArraySchema', {
  enumerable: true,
  get: function get() {
    return _schema.validateAsArraySchema;
  }
});
Object.defineProperty(exports, 'fromObjectSchema', {
  enumerable: true,
  get: function get() {
    return _schema.fromObjectSchema;
  }
});
Object.defineProperty(exports, 'fromObjectSchemaStrict', {
  enumerable: true,
  get: function get() {
    return _schema.fromObjectSchemaStrict;
  }
});
Object.defineProperty(exports, 'fromArraySchema', {
  enumerable: true,
  get: function get() {
    return _schema.fromArraySchema;
  }
});
Object.defineProperty(exports, 'objectValidator', {
  enumerable: true,
  get: function get() {
    return _schema.objectValidator;
  }
});
Object.defineProperty(exports, 'arrayValidator', {
  enumerable: true,
  get: function get() {
    return _schema.arrayValidator;
  }
});

var _typecheck = require('./lib/typecheck');

Object.defineProperty(exports, 'isISOString', {
  enumerable: true,
  get: function get() {
    return _typecheck.isISOString;
  }
});
Object.defineProperty(exports, 'isDate', {
  enumerable: true,
  get: function get() {
    return _typecheck.isDate;
  }
});
Object.defineProperty(exports, 'isObject', {
  enumerable: true,
  get: function get() {
    return _typecheck.isObject;
  }
});
Object.defineProperty(exports, 'isArray', {
  enumerable: true,
  get: function get() {
    return _typecheck.isArray;
  }
});
Object.defineProperty(exports, 'isType', {
  enumerable: true,
  get: function get() {
    return _typecheck.isType;
  }
});

var _validators = require('./lib/validators');

Object.defineProperty(exports, 'alwaysErr', {
  enumerable: true,
  get: function get() {
    return _validators.alwaysErr;
  }
});
Object.defineProperty(exports, 'alwaysOK', {
  enumerable: true,
  get: function get() {
    return _validators.alwaysOK;
  }
});
Object.defineProperty(exports, 'fromPredicate', {
  enumerable: true,
  get: function get() {
    return _validators.fromPredicate;
  }
});
Object.defineProperty(exports, 'validateIsType', {
  enumerable: true,
  get: function get() {
    return _validators.validateIsType;
  }
});
Object.defineProperty(exports, 'validateIsIn', {
  enumerable: true,
  get: function get() {
    return _validators.validateIsIn;
  }
});
Object.defineProperty(exports, 'validateIsObject', {
  enumerable: true,
  get: function get() {
    return _validators.validateIsObject;
  }
});
Object.defineProperty(exports, 'validateObjHasKey', {
  enumerable: true,
  get: function get() {
    return _validators.validateObjHasKey;
  }
});
Object.defineProperty(exports, 'validateObjPropHasType', {
  enumerable: true,
  get: function get() {
    return _validators.validateObjPropHasType;
  }
});
Object.defineProperty(exports, 'validateObjPropPasses', {
  enumerable: true,
  get: function get() {
    return _validators.validateObjPropPasses;
  }
});
Object.defineProperty(exports, 'validateObjOnlyHasKeys', {
  enumerable: true,
  get: function get() {
    return _validators.validateObjOnlyHasKeys;
  }
});
Object.defineProperty(exports, 'validateIsArray', {
  enumerable: true,
  get: function get() {
    return _validators.validateIsArray;
  }
});
Object.defineProperty(exports, 'validateArrayItemsHaveType', {
  enumerable: true,
  get: function get() {
    return _validators.validateArrayItemsHaveType;
  }
});
Object.defineProperty(exports, 'validateArrayItemsPass', {
  enumerable: true,
  get: function get() {
    return _validators.validateArrayItemsPass;
  }
});