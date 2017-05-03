const {
  checkIsObject,
  checkIsArray,
  checkRequiredFields,
  checkExtraFields,
  checkFieldPredicates,
  checkArrayPredicates,
  checkFieldsTypecheck,
  checkItemsTypecheck,
  checkFieldSchemaValidators,
  checkArraySchemaValidator,
} = require('./checks');

const { OK, Err, isOK } = require('./classes');

/**
 * Construct a result object from an array of errors
 */
const buildResult = errors =>
  (errors.length === 0 ? new OK() : new Err(errors));

/**
 * Compose a series of validators (left-to-right)
 */
const compose = (...validators) => schema => data =>
  validators.reduce((res, v) => (isOK(res) ? v(schema, data) : res), {});

/**
 * Validate an object against a schema
 */
const objectValidator = compose([
  checkIsObject,
  checkRequiredFields,
  checkExtraFields,
  checkFieldsTypecheck,
  checkFieldPredicates,
  checkFieldSchemaValidators,
]);

/**
 * Validate an array against a schema
 */
const arrayValidator = compose([
  checkIsArray,
  checkItemsTypecheck,
  checkArrayPredicates,
  checkArraySchemaValidator,
]);

module.exports = {
  compose,
  objectValidator,
  arrayValidator,
};
