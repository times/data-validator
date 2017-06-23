'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Check functions should return an array of error strings
 */

var _require = require('./helpers'),
    isObject = _require.isObject,
    isArray = _require.isArray,
    isDate = _require.isDate,
    typechecks = _require.typechecks;

var _require2 = require('./result'),
    ok = _require2.ok,
    err = _require2.err,
    toResult = _require2.toResult;

// This will move later


Array.prototype.toResult = toResult;

/**
 * Is the given data an object?
 */
module.exports.validateIsObject = function (schema) {
  return function (data) {
    return isObject(data) ? ok() : err(['Data was not an object']);
  };
};

/**
 * Is the given data an array?
 */
module.exports.validateIsArray = function (schema) {
  return function (data) {
    return isArray(data) ? ok() : err(['Data was not an array']);
  };
};

/**
 * Are all the required object fields present?
 */
module.exports.validateRequiredFields = function (schema) {
  return function (data) {
    return Object.keys(schema).filter(function (k) {
      return schema[k].required;
    }).filter(function (k) {
      return !data.hasOwnProperty(k);
    }).map(function (k) {
      return 'Missing required field "' + k + '"';
    }).toResult();
  };
};

/**
 * Are there any extra object fields present?
 */
module.exports.validateExtraFields = function (schema) {
  return function (data) {
    return Object.keys(data).filter(function (k) {
      return !schema.hasOwnProperty(k);
    }).map(function (k) {
      return 'Extra field "' + k + '"';
    }).toResult();
  };
};

/**
 * Does each object field typecheck?
 */
module.exports.validateFieldsTypecheck = function (schema) {
  return function (data) {
    return Object.keys(data).filter(function (k) {
      return schema[k] && schema[k].hasOwnProperty('type');
    }).filter(function (k) {
      return !typechecks(data[k], schema[k].type);
    }).map(function (k) {
      return 'Field "' + k + '" failed to typecheck (expected ' + schema[k].type + ')';
    }).toResult();
  };
};

/**
 * Does each array item typecheck?
 */
module.exports.validateItemsTypecheck = function (_ref) {
  var type = _ref.type;
  return function (data) {
    return data.filter(function (d) {
      return !typechecks(d, type);
    }).map(function (d) {
      return 'Item "' + d + '" failed to typecheck (expected ' + type + ')';
    }).toResult();
  };
};

/**
 * For each object field, check that its predicates succeed (if it has any)
 */
module.exports.validateFieldPredicates = function (schema) {
  return function (data) {
    return Object.keys(data).filter(function (k) {
      return schema[k] && schema[k].hasOwnProperty('predicates');
    })
    // Apply all the predicates for the given field and flatten the result
    .reduce(function (errs, k) {
      return [].concat(_toConsumableArray(errs), _toConsumableArray(schema[k].predicates.filter(function (p) {
        return !p.test(data[k]);
      }).map(function (p) {
        return p.onError(data[k]);
      })));
    }, []).toResult();
  };
};

/**
 * If there are predicates, do they succeed for every array item?
 */
module.exports.validateArrayPredicates = function (_ref2) {
  var predicates = _ref2.predicates;
  return function (data) {
    return (predicates ? predicates
    // Apply the predicates to every array item and flatten the error arrays
    .reduce(function (errs, p) {
      return [].concat(_toConsumableArray(errs), _toConsumableArray(data.filter(function (d) {
        return !p.test(d);
      }).map(p.onError)));
    }, []) : []).toResult();
  };
};

/**
 * If any object fields have schemaValidators attached, do they succeed?
 */
module.exports.validateFieldSchemaValidators = function (schema) {
  return function (data) {
    return Object.keys(data).filter(function (k) {
      return schema[k].hasOwnProperty('schemaValidator');
    })
    // Apply the nested schemaValidator and flatten the error arrays
    .reduce(function (errs, k) {
      return [].concat(_toConsumableArray(errs), _toConsumableArray(schema[k].schemaValidator(data[k]).errors.map(function (e) {
        return 'At field "' + k + '": ' + e;
      })));
    }, []).toResult();
  };
};

/**
 * If the array has a schemaValidator attached, does it succeed?
 */
module.exports.validateArraySchemaValidator = function (_ref3) {
  var schemaValidator = _ref3.schemaValidator;
  return function (data) {
    return (schemaValidator ? data
    // Apply the schemaValidator to every item and flatten the error arrays
    .map(schemaValidator).reduce(function (errs, res, i) {
      return [].concat(_toConsumableArray(errs), _toConsumableArray(res.errors.map(function (e) {
        return 'At item ' + i + ': ' + e;
      })));
    }, []) : []).toResult();
  };
};