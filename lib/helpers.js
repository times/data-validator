/**
 * Helper functions should return booleans
 */

/**
 * Is the parameter a valid ISO 8601 date string?
 *
 * Ref: http://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
 */
const isISOString = str =>
  typeof str === 'string' &&
  str.match(
    /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i
  ) !== null;

/**
 * Is the parameter a valid date object or string?
 */
const isDate = val => val instanceof Date || isISOString(val);

/**
 * Is the parameter a non-array, non-date object?
 */
const isObject = data =>
  data && typeof data === 'object' && !isArray(data) && !isDate(data);

/**
 * Is the parameter an array?
 */
const isArray = arr => Array.isArray(arr);

/**
 * Does the given value match the given type?
 */
const typechecks = (val, type) => {
  switch (type) {
    case 'array':
      return isArray(val);
    case 'date':
      return isDate(val);
    case 'object':
      return isObject(val);
    default:
      return typeof val === type;
  }
};

module.exports = {
  isISOString,
  isDate,
  isObject,
  isArray,
  typechecks,
};
