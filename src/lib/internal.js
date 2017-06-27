export type { ObjectSchema, SchemaRules } from './compose';

import { all, allUntilFailure, flatten } from './compose';

import {
  validateIsObject,
  validateObjPropHasType,
  alwaysErr,
} from './validators';

import { mapErrors, getErrors } from './result';

type ValidateAsSchemaRules = SchemaRules => Result;
const validateAsSchemaRules: ValidateAsSchemaRules = rules =>
  allUntilFailure([
    validateIsObject,
    ...Object.keys(rules)
      .filter(k => ['required', 'type', 'validator'].includes(k))
      .map(k => {
        if (k === 'required')
          return validateObjPropHasType('boolean')('required');
        if (k === 'type') return validateObjPropHasType('string')('type');
        return validateObjPropHasType('function')('validator');
      }),
  ])(rules);

type ValidateAsNestedSchemaRules = string => SchemaRules => Result;
const validateAsNestedSchemaRules: ValidateAsNestedSchemaRules = field => schema =>
  validateAsSchemaRules(schema[field]);

type ProcessSchemaError = SchemaResult => Array<Validator>;
export const processSchemaError: ProcessSchemaError = schemaResult => [
  alwaysErr(getErrors(mapErrors(err => `Schema error: ${err}`)(schemaResult))),
];

type ValidateAsObjectSchema = ObjectSchema => Validator;
export const validateAsObjectSchema: ValidateAsObjectSchema = schema =>
  allUntilFailure([
    validateIsObject,
    ...Object.keys(schema).map(k => validateAsNestedSchemaRules(k)),
  ])(schema);

type ValidateAsArraySchema = ArraySchema => Validator;
export const validateAsArraySchema: ValidateAsArraySchema = schema =>
  allUntilFailure([validateIsObject, validateAsSchemaRules])(schema);
