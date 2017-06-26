# Schema Validator

> Simple functional and composable JavaScript validation library

[![Build Status](https://travis-ci.org/times/schema-validator.svg?branch=master)](https://travis-ci.org/times/schema-validator) [![Code coverage](https://codecov.io/gh/times/schema-validator/branch/master/graph/badge.svg)](https://codecov.io/gh/times/schema-validator) [![npm version](https://badge.fury.io/js/%40times%2Fschema-validator.svg)](https://badge.fury.io/js/%40times%2Fschema-validator)


## Use

Validate an object based on a schema:

```js
const { objectValidator, ok, err } = require('@times/schema-validator');

const objectSchema = {
  name: {
    type: 'string',
    required: true,
    validator: s => s.length <= 10 ? ok() : err([`"${s}" was longer than 10`]),
  },
  age: {
    type: 'number',
    required: false
  }
};

const isValid = objectValidator(objectSchema);

const alice = {
  name: 'Alice',
  age: 23
};
isValid(alice); // { valid: true, errors: [] }

const bob = {
  age: 'thirty'
};
isValid(bob); // { valid: false, errors: [ `Missing required field "name"`, `Field "age" failed to typecheck (expected number)` ] }

const christopher = {
  name: 'Christopher',
}
isValid(christopher); // { valid: false, errors: [ `At field "name": "Christopher" was longer than 10` ] }
```
    

Validate an array based on a schema:

```js
const { arrayValidator, ok, err } = require('@times/schema-validator');

const arraySchema = {
  type: 'number',
  validator: n => n >= 10 ? ok() : err([`${n} was less than 10`])
};

const isValid = arrayValidator(arraySchema);

const numbers1 = [ 9, 10, 11 ];
isValid(numbers1); // { valid: false, errors: [ `At item 0: 9 was less than 10` ] }

const numbers2 = [ 'ten', 11 ];
isValid(numbers2); // { valid: false, errors: [ `Item "ten" failed to typecheck (expected number)` ] }
```


## Schema properties

An object schema consists of field names that map to sets of properties. Each set of properties can optionally include:

- `type`: the type of the field. Can be string, number, date, array, object, function...
- `required`: whether the field is required. Should be true or false
- `validator`: a nested validator that should be applied to the contents of the field

An array schema can similarly have the following optional properties:

- `type`: the type of the items in the array
- `validator`: a nested validator that should be applied to each item in the array


## Compose

Two useful functions, `objectValidator` and `arrayValidator`, are provided by default. Both accept a schema and turn it into a validator.

If these functions are insufficient, however, there are several functions available for you to build and compose your own validators.

A validator is any function with the signature `data -> Result`, where a Result can be constructed using the provided `ok()` or `err()` functions. `err()` accepts an array of error messages.

To chain multiple validators together you can use the `all` or `some` composition functions. For example:

```js
const validatorOne = data => data <= 3 ? ok() : err([`Data was greater than three`]);

const validatorTwo = ...

// Composing with `all` returns a validator that will succeed if all of the given validators succeed
const composedValidator1 = all([
  validatorOne,
  validatorTwo
]);
const result1 = composedValidator1(data);

// Using `some` returns a validator that will succeed if at least one of the given validators succeeds
const composedValidator2 = some([
  validatorOne,
  validatorTwo,
]);
const result2 = composedValidator2(data);
```

You can of course write your own composition functions. A composition function must accept an array of validators and run them, somehow combining the Results into a single Result.


## Converting from schemas

If you would like to use a schema beyond the supported object and array schemas, you can make use of the following exported functions:

- `fromObjectSchema`: Converts an object schema to an array of validators
- `fromObjectSchemaStrict`: Converts an object schema to an array of validators, including a validator that checks the object has no extra fields
- `fromArraySchema`: Converts an array schema to an array of validators

You can also write your own schema conversion functions should you wish.

The resulting list of validators can then be combined into a single validator using `all`, `some` or your own composition function; this is how the default `objectValidator` and `arrayValidator` helpers work.


## Contributing

Pull requests are very welcome. Please include a clear description of any changes, and full test coverage.

During development you can run tests with

    yarn test


The library uses Flow for type checking. You can run Flow with

    yarn flow


## Contact

Elliot Davies (elliot.davies@the-times.co.uk)
