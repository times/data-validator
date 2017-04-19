# Schema Validator

> Basic schema validator for JS objects and arrays

[![Build Status](https://travis-ci.org/times/schema-validator.svg?branch=master)](https://travis-ci.org/times/schema-validator)

## Use

Objects:

    const { objectValidator } = require('schema-validator');

    const objectSchema = {
      name: {
        type: 'string',
        required: true,
        predicates: [
          {
            test: s => s.length <= 20,
            onError: s => `${s} was longer than 20`
          }
        ]
      },
      age: {
        type: 'number',
        required: false
      }
    };

    const isValid = objectValidator(objectSchema);

    const alice = {
      name: 'Alice Smith',
      age: 23
    };

    const bob = {
      age: 'thirty'
    };

    isValid(alice); // { valid: true, errors: [] }
    isValid(bob); // { valid: false, errors: [ ... ] }

Arrays:


    const { arrayValidator } = require('schema-validator');

    const arraySchema = {
      type: 'number',
      predicates: [
        {
          test: n => n >= 10,
          onError: n => `${n} was less than 10`
        }
      ]
    };

    const isValid = arrayValidator(arraySchema);

    const numbers1 = [ 1, 2, 3 ];
    const numbers2 = [ 9, 10, 11 ];
    const numbers3 = [ 'one', 'two' ];

    isValid(numbers1); // { valid: true, errors: [] }
    isValid(numbers2); // { valid: false, errors: [ ... ] }
    isValid(numbers3); // { valid: false, errors: [ ... ] }


## Schema properties

An object schema consists of field names that map to sets of properties. Each set of properties can include:

- `type` (required): the type of the field. Can be string, number, date, array, object
- `required` (optional): whether the field is required. Can be true or false, or omitted
- `predicates` (optional): an array of predicates that should be applied to the contents of the field
- `schemaValidator` (optional): if the field is an array or object, you can provide a validator that should be applied to the contents of the field

An array schema can have the following properties:

- `type` (required): the type of the items in the array
- `predicates` (optional): an array of predicates that should be applied to every item in the array
- `schemaValidator` (optional): if the array items are arrays or objects, you can provide a validator that should be applied to each array item


### Predicates

Predicates are boolean functions that can be applied to array items. They receive the array item as an argument.

You must also specify an error message, which will be used when the predicate returns false. The error message is specified through an `onError` function that also receives the array item as an argument.

For example:

    {
      test: s => s.includes('xyz'),
      onError: s => `The string "${s}" did not include "xyz"`
    }


## Contributing

Pull requests are very welcome. Please include a clear description of any changes, and full test coverage.

During development you can run tests with

    npm test


## Contact

Elliot Davies (elliot.davies@the-times.co.uk)
