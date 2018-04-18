// @flow
import { append, compose, filter, keys, map, prepend, reduce } from 'ramda';

import {
  type Validator,
  validateIsObject,
  validateObjHasKey,
  validateObjFields,
  validateObjPropHasType,
  validateObjPropPasses,
  validateObjOnlyHasKeys,
  validateIsArray,
  validateArrayItemsHaveType,
  validateArrayItems,
  alwaysOK,
  alwaysErr,
} from './validators';

import { all, allWhileOK } from './compose';
import { type Result, isErr } from './result';
import { getErrors } from './printer';

/**
 * Each field within a schema can optionally specify the following rules:
 *
 *  - required: Is the field required?
 *  - type: What should the type of the field be?
 *  - validator: A validator that should be applied to the field value
 */
type SchemaRules = {
  required?: boolean,
  type?: string,
  validator?: Validator,
};

/**
 * A ruleset for an array will apply to each of its item
 */
type ArraySchema = SchemaRules;

/**
 * A schema for an object should specify a ruleset for each field
 */
type ObjectSchema = { +[key: string]: SchemaRules };

/**
 * Converts an individual schema rule to a validator
 */
type ConvertSchemaRuleToValidator = string => Validator;
const convertSchemaRuleToValidator: ConvertSchemaRuleToValidator = key => {
  switch (key) {
    case 'required':
      return validateObjPropHasType('boolean')('required');
    case 'type':
      return validateObjPropHasType('string')('type');
    case 'validator':
      return validateObjPropHasType('function')('validator');
    default:
      return alwaysOK();
  }
};

/**
 * Validates that a set of schema rules are in the correct format
 */
type ValidateAsSchemaRules = SchemaRules => Result;
const validateAsSchemaRules: ValidateAsSchemaRules = rules => {
  const ruleValidators = map(convertSchemaRuleToValidator, keys(rules));
  return allWhileOK(prepend(validateIsObject, ruleValidators))(rules);
};

/**
 * If an invalid schema was passed, prepends `Schema error:` to all the errors
 * and then returns them in an `alwaysErr` validator
 */
type ProcessSchemaError = Result => Array<Validator>;
const processSchemaError: ProcessSchemaError = compose(
  x => [x],
  alwaysErr,
  map(e => `Schema error: ${e}`),
  getErrors
);

/**
 * Validates that an ObjectSchema is in the correct format
 */
type ValidateAsObjectSchema = ObjectSchema => Result;
export const validateAsObjectSchema: ValidateAsObjectSchema = allWhileOK([
  validateIsObject,
  validateObjFields(validateAsSchemaRules),
]);

/**
 * Validates that an ArraySchema is in the correct format
 */
type ValidateAsArraySchema = ArraySchema => Result;
export const validateAsArraySchema: ValidateAsArraySchema = allWhileOK([
  validateIsObject,
  validateAsSchemaRules,
]);

/**
 * Given an ObjectSchema, checks its validity and then uses it to produce an
 * array of validators that data can be run through
 */
type FromObjectSchema = ObjectSchema => Array<Validator>;
export const fromObjectSchema: FromObjectSchema = (schema = {}) => {
  const schemaResult = validateAsObjectSchema(schema);
  if (isErr(schemaResult)) return processSchemaError(schemaResult);

  const requiredChecks = map(
    validateObjHasKey,
    filter(k => !!schema[k].required, keys(schema))
  );

  const typeChecks = reduce(
    (acc, k) => {
      const type = schema[k].type;
      return type ? append(validateObjPropHasType(type)(k), acc) : acc;
    },
    [],
    keys(schema)
  );

  const validatorChecks = reduce(
    (acc, k) => {
      const validator = schema[k].validator;
      return validator ? append(validateObjPropPasses(validator)(k), acc) : acc;
    },
    [],
    keys(schema)
  );

  return [
    validateIsObject,
    all(requiredChecks),
    all(typeChecks),
    all(validatorChecks),
  ];
};

/**
 * Converts an ObjectSchema to an array of validators and additionally forbid
 * extra fields
 */
export const fromObjectSchemaStrict: FromObjectSchema = (schema = {}) =>
  append(validateObjOnlyHasKeys(keys(schema)), fromObjectSchema(schema));

/**
 * Given an ArraySchema, checks its validity and then uses it to produce an
 * array of validators that data can be run through
 */
type FromArraySchema = ArraySchema => Array<Validator>;
export const fromArraySchema: FromArraySchema = (schema = {}) => {
  const schemaResult = validateAsArraySchema(schema);
  if (isErr(schemaResult)) return processSchemaError(schemaResult);

  const vs = reduce(
    (acc, k) => {
      if (k === 'type' && schema[k]) {
        return append(validateArrayItemsHaveType(schema[k]), acc);
      } else if (k === 'validator' && schema[k]) {
        return append(validateArrayItems(schema[k]), acc);
      } else return acc;
    },
    [],
    keys(schema)
  );

  return prepend(validateIsArray, vs);
};

/**
 * Precomposed helper for objects
 */
type ObjectValidator = ObjectSchema => Validator;
export const objectValidator: ObjectValidator = compose(
  allWhileOK,
  fromObjectSchemaStrict
);

/**
 * Precomposed helper for arrays
 */
type ArrayValidator = ArraySchema => Validator;
export const arrayValidator: ArrayValidator = compose(
  allWhileOK,
  fromArraySchema
);
