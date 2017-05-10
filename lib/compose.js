const { isOK, ok } = require('./result');
const {
  validateIsObject,
  validateIsArray,
  validateRequiredFields,
  validateExtraFields,
  validateFieldPredicates,
  validateArrayPredicates,
  validateFieldsTypecheck,
  validateItemsTypecheck,
  validateFieldSchemaValidators,
  validateArraySchemaValidator,
} = require('./validators');

/**
 * Compose a series of validators (left-to-right)
 */
const compose = (...validators) => schema => data =>
  validators.reduce((res, v) => (isOK(res) ? v(schema)(data) : res), ok());

/**
 * Precomposed validator for objects
 */
const objectValidator = compose(
  validateIsObject,
  validateRequiredFields,
  validateExtraFields,
  validateFieldsTypecheck,
  validateFieldPredicates,
  validateFieldSchemaValidators
);

/**
 * Precomposed validator for arrays
 */
const arrayValidator = compose(
  validateIsArray,
  validateItemsTypecheck,
  validateArrayPredicates,
  validateArraySchemaValidator
);

module.exports = {
  compose,
  objectValidator,
  arrayValidator,
};
