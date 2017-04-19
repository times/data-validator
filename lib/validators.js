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

/**
 * Construct a result object from an array of errors
 */
const buildResult = errors => ({ valid: errors.length === 0, errors });

/**
 * Compose a series of validators (left-to-right)
 */
const compose = validators => schema => data =>
  validators.reduce(
    (res, v) => (res.valid ? buildResult(v(schema, data)) : res),
    { valid: true, errors: [] }
  );

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
