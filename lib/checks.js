/**
 * Check functions should return an array of error strings
 */

const { isObject, isArray, isDate, typechecks } = require('./helpers');

/**
 * Is the given data an object?
 */
module.exports.checkIsObject = (schema, data) =>
  isObject(data) ? [] : [`Data was not an object`];

/**
 * Is the given data an array?
 */
module.exports.checkIsArray = (schema, data) =>
  isArray(data) ? [] : [`Data was not an array`];

/**
 * Are all the required object fields present?
 */
module.exports.checkRequiredFields = (schema, data) =>
  Object.keys(schema)
    .filter(k => schema[k].required)
    .filter(k => !data.hasOwnProperty(k))
    .map(k => `Missing required field "${k}"`);

/**
 * Are there any extra object fields present?
 */
module.exports.checkExtraFields = (schema, data) =>
  Object.keys(data)
    .filter(k => !schema.hasOwnProperty(k))
    .map(k => `Extra field "${k}"`);

/**
 * Does each object field typecheck?
 */
module.exports.checkFieldsTypecheck = (schema, data) =>
  Object.keys(data)
    .filter(k => !typechecks(data[k], schema[k].type))
    .map(k => `Field "${k}" failed to typecheck (expected ${schema[k].type})`);

/**
 * Does each array item typecheck?
 */
module.exports.checkItemsTypecheck = ({ type }, data) =>
  data
    .filter(d => !typechecks(d, type))
    .map(d => `Item "${d}" failed to typecheck (expected ${type})`);

/**
 * If there are predicates, do they succeed for every array item?
 */
module.exports.checkArrayPredicates = ({ predicates }, data) =>
  predicates
    ? predicates
        // Apply the predicates to every array item and flatten the error arrays
        .reduce(
          (errs, p) => [
            ...errs,
            ...data.filter(d => !p.test(d)).map(p.onError),
          ],
          []
        )
    : [];

/**
 * If any object fields have schemaValidators attached, do they succeed?
 */
module.exports.checkFieldSchemaValidators = (schema, data) =>
  Object.keys(data)
    .filter(k => schema[k].hasOwnProperty('schemaValidator'))
    // Apply the nested schemaValidator and flatten the error arrays
    .reduce(
      (errs, k) => [
        ...errs,
        ...schema[k]
          .schemaValidator(data[k])
          .errors.map(e => `At field "${k}": ${e}`),
      ],
      []
    );

/**
 * If the array has a schemaValidator attached, does it succeed?
 */
module.exports.checkArraySchemaValidator = ({ schemaValidator }, data) =>
  schemaValidator
    ? data
        // Apply the schemaValidator to every item and flatten the error arrays
        .map(schemaValidator)
        .reduce(
          (errs, res, i) => [
            ...errs,
            ...res.errors.map(e => `At item ${i}: ${e}`),
          ],
          []
        )
    : [];
