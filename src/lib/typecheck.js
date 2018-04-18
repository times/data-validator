// @flow

/**
 * Is the parameter a valid ISO 8601 date string?
 *
 * Ref: http://stackoverflow.com/questions/3143070/javascript-regex-iso-datetime
 */
type IsISOString = any => boolean;
export const isISOString: IsISOString = val =>
  typeof val === 'string' &&
  val.match(
    /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i
  ) !== null;

/**
 * Is the parameter a valid date object or string?
 */
type IsDate = any => boolean;
export const isDate: IsDate = val => val instanceof Date || isISOString(val);

/**
 * Is the parameter a non-array, non-date object?
 */
type IsObject = any => boolean;
export const isObject: IsObject = val =>
  val && typeof val === 'object' && !isArray(val) && !isDate(val);

/**
 * Is the parameter an array?
 */
type IsArray = any => boolean;
export const isArray: IsArray = val => Array.isArray(val);

/**
 * Is the parameter null?
 */
type IsNull = any => boolean;
export const isNull: IsNull = val => val === null;

/**
 * Does the given value match the given type?
 */
type IsType = string => any => boolean;
export const isType: IsType = type => val => {
  switch (type) {
    case 'array':
      return isArray(val);
    case 'date':
      return isDate(val);
    case 'object':
      return isObject(val);
    case 'null':
      return isNull(val);
    default:
      return typeof val === type;
  }
};
