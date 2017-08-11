import { expect } from 'chai';
import {
  validateAsObjectSchema,
  validateAsArraySchema,
  fromObjectSchema,
  fromObjectSchemaStrict,
  fromArraySchema,
  objectValidator,
  arrayValidator,
} from '../src/lib/schema';

import {
  validateIsObject,
  validateObjHasKey,
  validateArrayItemsHaveType,
} from '../src/lib/validators';

import { isOK, isErr, err, ok, toResult } from '../src/lib/result';
import { all, allWhileOK } from '../src/lib/compose';

describe('schema', () => {
  describe('#validateAsObjectSchema()', () => {
    it('should return a Result which validates the supplied object schema', () => {
      const validSchema1 = validateAsObjectSchema({
        field1: {
          required: true,
        },
        field2: {
          type: 'string',
        },
      });

      expect(isOK(validSchema1)).to.be.true;

      const validSchema2 = validateAsObjectSchema({
        field1: {
          otherProp: true,
        },
      });

      expect(isOK(validSchema2)).to.be.true;

      const invalidSchema1 = validateAsObjectSchema({
        field1: {
          required: 'not-a-boolean',
        },
        field2: {
          type: 1234,
        },
      });

      expect(isErr(invalidSchema1)).to.be.true;
    });
  });

  describe('#validateAsArraySchema()', () => {
    it('should return a Result which validates the supplied array schema', () => {
      const validSchema = validateAsArraySchema({
        type: 'string',
      });
      expect(isOK(validSchema)).to.be.true;

      const invalidSchema = validateAsArraySchema({
        type: 1234,
      });
      expect(isErr(invalidSchema)).to.be.true;

      const invalidSchema2 = validateAsArraySchema({
        validator: 'not-a-function',
      });
      expect(isErr(invalidSchema2)).to.be.true;
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

      const validate = allWhileOK(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 1234 }))).to.be.true;

      expect(validate({ field2: 1234 }).errors).to.deep.equal([
        'Schema error: "test-1234" failed to typecheck (expected object)',
      ]);
    });

    it('should handle cases where a schema field passes an invalid required property', () => {
      const vs = fromObjectSchema({
        field1: {
          required: 'yes',
        },
      });

      expect(vs.length).to.equal(1);

      const validate = allWhileOK(vs);
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

      const validate = allWhileOK(vs);
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

      const validate = allWhileOK(vs);
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
        `At field "field1": "12345" failed to typecheck (expected object)`,
      ]);

      // One level deeper
      const vs2 = fromObjectSchema({
        field2: {
          validator: all(vs1),
        },
      });
      const validate2 = all(vs2);
      expect(validate2({ field2: { field1: 12345 } }).errors).to.deep.equal([
        `At field "field2": At field "field1": "12345" failed to typecheck (expected object)`,
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

      const validate = allWhileOK(vs);
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

      const validate = allWhileOK(vs);
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
        `At item 1: "1" failed to typecheck (expected object)`,
      ]);

      // One level deeper
      const vs2 = fromArraySchema({
        validator: all(vs1),
      });
      const validate2 = all(vs2);
      expect(validate2([[{}], [1]]).errors).to.deep.equal([
        `At item 1: At item 0: "1" failed to typecheck (expected object)`,
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

      const validate = allWhileOK([
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

      const validate = allWhileOK([arrayValidator(schema), arbitraryValidator]);

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
