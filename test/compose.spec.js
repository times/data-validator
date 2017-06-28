import { expect } from 'chai';

import {
  all,
  allUntilFailure,
  some,
  fromObjectSchema,
  fromObjectSchemaStrict,
  fromArraySchema,
  objectValidator,
  arrayValidator,
} from '../src/lib/compose';

import { isOK, isErr, ok, err, toResult } from '../src/lib/result';

import {
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateIsArray,
  validateArrayItemsHaveType,
} from '../src/lib/validators';

describe('compose', () => {
  describe('#all()', () => {
    it('should compose multiple validators into a single validator such that they all must succeed', () => {
      const validate = all([validateIsObject, validateObjHasKey('field1')]);

      expect(isErr(validate('not an object'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 'here' }))).to.be.true;

      expect(isOK(validate({ field1: 'here' }))).to.be.true;
    });

    it('can compose multiple times', () => {
      const v1 = all([validateIsObject]);
      const v2 = all([v1, validateObjHasKey('field1')]);
      const validate = all([v2, validateObjHasKey('field2')]);

      expect(isErr(validate('not an object'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 'here' }))).to.be.true;
      expect(isErr(validate({ field1: 'here', field3: 'also here' }))).to.be
        .true;

      expect(isOK(validate({ field1: 'here', field2: 'also here' }))).to.be
        .true;
    });

    it('runs the composed validators in order', () => {
      const validate = all([validateIsObject, validateObjHasKey('field1')]);

      expect(validate('not an object').errors).to.deep.equal([
        `Data was not an object`,
        `Missing required field \"field1\"`,
      ]);

      expect(validate({}).errors).to.deep.equal([
        `Missing required field "field1"`,
      ]);

      expect(validate({ field2: 'here' }).errors).to.deep.equal([
        `Missing required field "field1"`,
      ]);
    });

    it('can compose with a brand new validator', () => {
      const arbitraryValidator = data =>
        data.hasOwnProperty('arbitraryField')
          ? ok()
          : err([`Couldn't find arbitraryField`]);

      const validate = all([validateIsObject, arbitraryValidator]);

      expect(isErr(validate(''))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isOK(validate({ arbitraryField: 'boo' }))).to.be.true;
    });
  });

  describe('#allUntilFailure()', () => {
    it('should compose multiple validators into a single validator such that they all must succeed', () => {
      const validate = allUntilFailure([
        validateIsObject,
        validateObjHasKey('field1'),
      ]);

      expect(isErr(validate('not an object'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 'here' }))).to.be.true;

      expect(isOK(validate({ field1: 'here' }))).to.be.true;
    });

    it('can compose multiple times', () => {
      const v1 = allUntilFailure([validateIsObject]);
      const v2 = allUntilFailure([v1, validateObjHasKey('field1')]);
      const validate = allUntilFailure([v2, validateObjHasKey('field2')]);

      expect(isErr(validate('not an object'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 'here' }))).to.be.true;
      expect(isErr(validate({ field1: 'here', field3: 'also here' }))).to.be
        .true;

      expect(isOK(validate({ field1: 'here', field2: 'also here' }))).to.be
        .true;
    });

    it('runs the composed validators in order, stopping when a failure occurs, and returns the first error', () => {
      const validate = allUntilFailure([
        validateIsObject,
        validateObjHasKey('field1'),
        validateObjPropHasType('string')('field1'),
      ]);

      expect(validate('not an object').errors).to.deep.equal([
        `Data was not an object`,
      ]);

      expect(validate({}).errors).to.deep.equal([
        `Missing required field "field1"`,
      ]);

      expect(validate({ field1: {} }).errors).to.deep.equal([
        `Field \"field1\" failed to typecheck (expected string)`,
      ]);

      expect(validate({ field2: 'here' }).errors).to.deep.equal([
        `Missing required field "field1"`,
      ]);
    });

    it('can compose with a brand new validator', () => {
      const arbitraryValidator = data =>
        data.hasOwnProperty('arbitraryField')
          ? ok()
          : err([`Couldn't find arbitraryField`]);

      const validate = allUntilFailure([validateIsObject, arbitraryValidator]);

      expect(isErr(validate(''))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isOK(validate({ arbitraryField: 'boo' }))).to.be.true;
    });
  });

  describe('#some()', () => {
    it('should compose multiple validators such that only one needs to succeed', () => {
      const validate = some([validateIsObject, validateIsArray]);

      expect(isErr(validate('neither object nor array'))).to.be.true;
      expect(isErr(validate(123))).to.be.true;

      expect(isOK(validate({}))).to.be.true;
      expect(isOK(validate([]))).to.be.true;
    });

    it('returns errors from all the validators if it fails', () => {
      const validate = some([validateIsObject, validateIsArray]);
      expect(validate(123).errors).to.deep.equal([
        'Data was not an object',
        'Data was not an array',
      ]);
    });

    it('works as part of a schema', () => {
      const validateObjectSchema = allUntilFailure(
        fromObjectSchema({
          field2: {
            required: true,
            type: 'string',
          },
        })
      );

      const validateLteThree = n =>
        n <= 3 ? ok() : err([`${n} was greater than 3`]);

      const validateArraySchema = allUntilFailure(
        fromArraySchema({
          type: 'number',
          validator: validateLteThree,
        })
      );

      const validate = allUntilFailure(
        fromObjectSchema({
          field1: {
            validator: some([validateObjectSchema, validateArraySchema]),
          },
        })
      );

      expect(isErr(validate({ field1: 123 }))).to.be.true;
      expect(isErr(validate({ field1: 'abc' }))).to.be.true;

      expect(isOK(validate({ field1: [] }))).to.be.true;
      expect(isOK(validate({ field1: [1, 2, 3] }))).to.be.true;

      expect(isErr(validate({ field1: [2, 3, 4] }))).to.be.true;

      expect(isOK(validate({ field1: { field2: 'abc' } }))).to.be.true;

      expect(isErr(validate({ field1: { field2: 123 } }))).to.be.true;
      expect(isErr(validate({ field1: { field3: 'abc' } }))).to.be.true;
    });

    it('can be composed multiple times', () => {
      const v1 = some([validateIsObject]);
      const validate = some([v1, validateIsArray]);

      expect(isErr(validate(123))).to.be.true;
      expect(isErr(validate('abc'))).to.be.true;

      expect(isOK(validate({}))).to.be.true;
      expect(isOK(validate([]))).to.be.true;
    });
  });

  describe('#fromObjectSchema()', () => {
    it('should handle cases where no schema is passed', () => {
      const vs = fromObjectSchema();
      expect(vs.length).to.equal(4);

      const validate = all(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isOK(validate({}))).to.be.true;
    });

    it('should handle cases where the schema is not an object', () => {
      const vs = fromObjectSchema('string');
      expect(vs.length).to.equal(1);

      const validate = all(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;

      expect(validate([]).errors).to.deep.equal([
        'Schema error: Schemas must be objects',
      ]);
    });

    it('should handle cases where a schema key is not an object', () => {
      const vs = fromObjectSchema({
        field1: 'test-1234',
        field2: {
          required: true,
        },
        field3: 'something',
      });

      expect(vs.length).to.equal(1);

      const validate = allUntilFailure(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 1234 }))).to.be.true;

      expect(validate({ field2: 1234 }).errors).to.deep.equal([
        'Schema error: Data was not an object',
      ]);
    });

    it('should handle cases where a schema field passes an invalid required property', () => {
      const vs = fromObjectSchema({
        field1: {
          required: 'yes',
        },
      });

      expect(vs.length).to.equal(1);

      const validate = allUntilFailure(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(validate({}).errors).to.deep.equal([
        `Schema error: Field "required" failed to typecheck (expected boolean)`,
      ]);
    });

    it('should handle cases where a schema field passes an invalid type property', () => {
      const vs = fromObjectSchema({
        field1: {
          type: 123,
        },
      });

      expect(vs.length).to.equal(1);

      const validate = allUntilFailure(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(validate({}).errors).to.deep.equal([
        `Schema error: Field "type" failed to typecheck (expected string)`,
      ]);
    });

    it('should handle cases where a schema field passes an invalid validator property', () => {
      const vs = fromObjectSchema({
        field1: {
          validator: { not: 'a', function: true },
        },
      });

      expect(vs.length).to.equal(1);

      const validate = allUntilFailure(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(validate({}).errors).to.deep.equal([
        `Schema error: Field "validator" failed to typecheck (expected function)`,
      ]);
    });

    it('should check the existence of required fields', () => {
      const vs1 = fromObjectSchema({
        field1: {
          required: true,
        },
      });
      expect(vs1.length).to.equal(4);

      const validate1 = all(vs1);
      expect(isErr(validate1({}))).to.be.true;
      expect(isErr(validate1({ field2: 'here' }))).to.be.true;
      expect(isOK(validate1({ field1: 'here' }))).to.be.true;
    });

    it('should check the types of fields', () => {
      const vs = fromObjectSchema({
        field1: {
          type: 'string',
        },
      });
      expect(vs.length).to.equal(4);

      const validate = all(vs);
      expect(isErr(validate({ field1: 123 }))).to.be.true;
      expect(isOK(validate({}))).to.be.true;
      expect(isOK(validate({ field1: 'here' }))).to.be.true;
    });

    it('should check both field existence and field types', () => {
      const vs = fromObjectSchema({
        field1: {
          required: true,
          type: 'number',
        },
        field2: {
          required: true,
        },
        field3: {
          type: 'array',
        },
      });
      expect(vs.length).to.equal(4);

      const validate = all(vs);
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field1: '123' }))).to.be.true;
      expect(isErr(validate({ field1: 123 }))).to.be.true;
      expect(isErr(validate({ field1: 123, field2: {}, field3: 'abc' }))).to.be
        .true;

      expect(isOK(validate({ field1: 123, field2: '' }))).to.be.true;
      expect(isOK(validate({ field1: 123, field2: '', field3: [] }))).to.be
        .true;
    });

    it('should support nested validators', () => {
      const vs = fromObjectSchema({
        field1: {
          validator: validateIsObject,
        },
      });
      expect(vs.length).to.equal(4);

      const validate = all(vs);
      expect(isErr(validate({ field1: 'not an object' }))).to.be.true;
      expect(isOK(validate({}))).to.be.true;
      expect(isOK(validate({ field1: {} }))).to.be.true;
    });

    it('should return prefixed error messages from nested validators', () => {
      const vs1 = fromObjectSchema({
        field1: {
          validator: validateIsObject,
        },
      });
      const validate1 = all(vs1);
      expect(validate1({ field1: 12345 }).errors).to.deep.equal([
        `At field "field1": Data was not an object`,
      ]);

      // One level deeper
      const vs2 = fromObjectSchema({
        field2: {
          validator: all(vs1),
        },
      });
      const validate2 = all(vs2);
      expect(validate2({ field2: { field1: 12345 } }).errors).to.deep.equal([
        `At field "field2": At field "field1": Data was not an object`,
      ]);
    });

    it('should ignore other schema fields', () => {
      const vs = fromObjectSchema({
        field1: {
          otherRule: true,
        },
      });
      expect(vs.length).to.equal(4);
    });

    it('should allow non-specified fields to exist', () => {
      const vs = fromObjectSchema({
        field1: {
          otherRule: true,
        },
      });

      const validate = all(vs);
      expect(isOK(validate({ test: 1234 }))).to.be.true;
    });
  });

  describe('#fromObjectSchemaStrict()', () => {
    it('should handle cases where no schema is passed', () => {
      const vs = fromObjectSchemaStrict();
      expect(vs.length).to.equal(5);

      const validate = all(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isOK(validate({}))).to.be.true;
    });

    it('should handle cases where the schema is not an object', () => {
      const vs = fromObjectSchemaStrict('string');
      expect(vs.length).to.equal(1);

      const validate = all(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
    });

    it('should add a check to forbid extra fields', () => {
      const vs1 = fromObjectSchemaStrict({});
      expect(vs1.length).to.equal(5);

      const vs2 = fromObjectSchemaStrict({
        field1: {},
        field2: {},
      });
      const validate2 = all(vs2);

      expect(isErr(validate2({ field1: 'xxx', field2: 123, field3: 'yyy' }))).to
        .be.true;
    });
  });

  describe('#fromArraySchema()', () => {
    it('should handle cases where no schema is passed', () => {
      const vs = fromArraySchema();
      expect(vs.length).to.equal(1);

      const validate = all(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isOK(validate([]))).to.be.true;
    });

    it('should handle cases where the schema is not an object', () => {
      const vs = fromArraySchema('string');
      expect(vs.length).to.equal(1);

      const validate = all(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isErr(validate([]))).to.be.true;

      expect(validate([]).errors).to.deep.equal([
        'Schema error: Schemas must be objects',
      ]);
    });

    it('should handle cases where a schema field passes an invalid type property', () => {
      const vs = fromArraySchema({
        type: 12345,
      });
      expect(vs.length).to.equal(1);

      const validate = allUntilFailure(vs);
      expect(isErr(validate([]))).to.be.true;

      expect(validate([]).errors).to.deep.equal([
        'Schema error: Field "type" failed to typecheck (expected string)',
      ]);
    });

    it('should handle cases where a schema field passes an invalid validator property', () => {
      const vs = fromArraySchema({
        validator: { not: 'a', function: true },
      });
      expect(vs.length).to.equal(1);

      const validate = allUntilFailure(vs);
      expect(isErr(validate([]))).to.be.true;

      expect(validate([]).errors).to.deep.equal([
        'Schema error: Field "validator" failed to typecheck (expected function)',
      ]);
    });

    it('should add validators to check the types of fields', () => {
      const vs = fromArraySchema({
        type: 'string',
      });
      expect(vs.length).to.equal(2);

      const validate = all(vs);
      expect(isErr(validate([1, 2, 3]))).to.be.true;
      expect(isErr(validate([1, '2', 3]))).to.be.true;
      expect(isOK(validate([]))).to.be.true;
      expect(isOK(validate(['a', 'b', 'c']))).to.be.true;
    });

    it('should support item validators', () => {
      const vs = fromArraySchema({
        validator: validateIsObject,
      });
      expect(vs.length).to.equal(2);

      const validate = all(vs);
      expect(isErr(validate([1, {}, {}]))).to.be.true;
      expect(isOK(validate([]))).to.be.true;
      expect(isOK(validate([{}, {}]))).to.be.true;
    });

    it('should return prefixed error messages from item validators', () => {
      const vs1 = fromArraySchema({
        validator: validateIsObject,
      });
      const validate1 = all(vs1);
      expect(validate1([{}, 1, {}]).errors).to.deep.equal([
        `At item 1: Data was not an object`,
      ]);

      // One level deeper
      const vs2 = fromArraySchema({
        validator: all(vs1),
      });
      const validate2 = all(vs2);
      expect(validate2([[{}], [1]]).errors).to.deep.equal([
        `At item 1: At item 0: Data was not an object`,
      ]);
    });

    it('should ignore other schema fields', () => {
      const vs = fromArraySchema({
        required: true,
      });
      const validate = all(vs);
      expect(vs.length).to.equal(1);
    });
  });

  describe('#objectValidator()', () => {
    it('exports a pre-composed helper for objects', () => {
      const schema = {
        field1: {
          required: true,
          type: 'string',
        },
        field2: {
          type: 'number',
          validator: x => (x < 10 ? ok() : err([`${x} was >= 10`])),
        },
        field3: {
          type: 'array',
          validator: validateArrayItemsHaveType('object'),
        },
      };

      const validate = objectValidator(schema);

      expect(isErr(validate('not an object'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 123 }))).to.be.true;
      expect(isErr(validate({ field1: 123 }))).to.be.true;
      expect(isErr(validate({ field1: 'here', field2: [] }))).to.be.true;
      expect(isErr(validate({ field1: 'here', field2: 11 }))).to.be.true;
      expect(isErr(validate({ field1: 'here', field4: 'also here' }))).to.be
        .true;
      expect(isErr(validate({ field1: 'here', field3: [1, 2, 3] }))).to.be.true;

      expect(isOK(validate({ field1: 'here' }))).to.be.true;
      expect(isOK(validate({ field1: 'here', field2: 6 }))).to.be.true;
      expect(isOK(validate({ field1: 'here', field2: 6, field3: [{ a: 1 }] })))
        .to.be.true;

      expect(
        validate({ field1: 123, field2: 'hello', field3: 1234 }).errors
      ).to.deep.equal([
        'Field "field1" failed to typecheck (expected string)',
        'Field "field2" failed to typecheck (expected number)',
        'Field "field3" failed to typecheck (expected array)',
      ]);
    });

    it('can compose with a brand new validator', () => {
      const schema = {
        field1: {
          required: true,
          type: 'string',
        },
        field2: {
          type: 'number',
          validator: x => (x < 10 ? ok() : err([`${x} was >= 10`])),
        },
        field3: {
          type: 'array',
          validator: validateArrayItemsHaveType('object'),
        },
      };

      const arbitraryValidator = data =>
        data.field1.length > 10
          ? ok()
          : err([`Field "field1" was not longer than 10 characters`]);

      const validate = allUntilFailure([
        objectValidator(schema),
        arbitraryValidator,
      ]);

      expect(isErr(validate(''))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field1: 'boo' }))).to.be.true;
      expect(isOK(validate({ field1: 'string-longer-than-ten-characters' }))).to
        .be.true;
    });
  });

  describe('#arrayValidator()', () => {
    it('exports a pre-composed helper for arrays', () => {
      const hasFewerThan3Keys = o =>
        Object.keys(o).length < 3 ? ok() : err([`Object has too many keys`]);

      const schema = {
        type: 'object',
        validator: all([hasFewerThan3Keys, validateObjHasKey('field1')]),
      };

      const validate = arrayValidator(schema);

      expect(isErr(validate('not an array'))).to.be.true;
      expect(isErr(validate([1, 2, 3]))).to.be.true;
      expect(isErr(validate(['one', 'two', 'three']))).to.be.true;
      expect(isErr(validate([{ field1: '' }, {}]))).to.be.true;
      expect(isErr(validate([{ field1: '', field2: '', field3: '' }]))).to.be
        .true;

      expect(isOK(validate([]))).to.be.true;
      expect(isOK(validate([{ field1: 'abc' }]))).to.be.true;
    });

    it('can compose with a brand new validator', () => {
      const schema = {
        type: 'string',
      };

      const arbitraryValidator = data =>
        toResult(
          data
            .filter(d => d.length < 10)
            .map(item => `Item "${item}" not longer than 10 characters`)
        );

      const validate = allUntilFailure([
        arrayValidator(schema),
        arbitraryValidator,
      ]);

      expect(isErr(validate(['boo', 'short']))).to.be.true;
      expect(
        isOK(
          validate(['string-longer-than-ten-characters', 'this-is-long-too'])
        )
      ).to.be.true;
      expect(
        isErr(validate(['string-longer-than-ten-characters', 'too-short']))
      ).to.be.true;
      expect(
        validate(['string-longer-than-ten-characters', 'too-short']).errors
      ).to.deep.equal(['Item "too-short" not longer than 10 characters']);
    });
  });
});
