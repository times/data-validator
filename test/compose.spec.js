import { expect } from 'chai';

import {
  all,
  some,
  fromObjectSchema,
  fromArraySchema,
  objectValidator,
  arrayValidator,
} from '../src/lib/compose';

import { isOK, isErr, ok, err } from '../src/lib/result';

import {
  validateIsObject,
  validateObjHasKey,
  validateIsArray,
  validateArrayItemsHaveType,
} from '../src/lib/validators';

describe('compose', () => {
  describe('#fromObjectSchema()', () => {
    it('should handle cases where no schema is passed', () => {
      const vs = fromObjectSchema();
      expect(vs.length).to.equal(1);

      const validate = all(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isOK(validate({}))).to.be.true;
    });

    it('should handle cases where the schema is not an object', () => {
      const vs = fromObjectSchema('string');
      expect(vs.length).to.equal(1);

      const validate = all(vs);
      expect(isErr(validate('string'))).to.be.true;
      expect(isOK(validate({}))).to.be.true;
    });

    it('should add validators to check the existence of required fields', () => {
      const vs1 = fromObjectSchema({
        field1: {
          required: true,
        },
      });
      expect(vs1.length).to.equal(2);

      const validate1 = all(vs1);
      expect(isErr(validate1({}))).to.be.true;
      expect(isErr(validate1({ field2: 'here' }))).to.be.true;
      expect(isOK(validate1({ field1: 'here' }))).to.be.true;

      // Don't add the rule when `required` is not `true`
      const vs2 = fromObjectSchema({
        field1: {
          required: 123,
        },
      });
      expect(vs2.length).to.equal(1);
    });

    it('should add validators to check the types of fields', () => {
      const vs = fromObjectSchema({
        field1: {
          type: 'string',
        },
      });
      expect(vs.length).to.equal(2);

      const validate = all(vs);
      expect(isErr(validate({ field1: 123 }))).to.be.true;
      expect(isOK(validate({}))).to.be.true;
      expect(isOK(validate({ field1: 'here' }))).to.be.true;
    });

    it('should add validators for both field existence and field types', () => {
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
      expect(vs.length).to.equal(5);

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
      expect(vs.length).to.equal(2);

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
      const validate = all(vs);
      expect(vs.length).to.equal(1);
    });

    xit('should not allow extra fields when the flag is set', () => {
      const vs = fromObjectSchema({
        field1: {
          type: 'string',
        },
        field2: {
          type: 'number',
        },
      });

      const validate = all(vs);

      expect(isErr(validate({ field1: 'xxx', field2: 123, field3: 'yyy' }))).to
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
      expect(isOK(validate([]))).to.be.true;
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
      ]);

      expect(validate({}).errors).to.deep.equal([
        `Missing required field "field1"`,
      ]);

      expect(validate({ field2: 'here' }).errors).to.deep.equal([
        `Missing required field "field1"`,
      ]);

      // expect(
      //   validate({ field1: 'here', field3: 'also here' }).errors
      // ).to.deep.equal([`Extra field "field3"`]);
    });

    it('can compose with a brand new validator', () => {
      const arbitraryValidator = data =>
        (data.hasOwnProperty('arbitraryField')
          ? ok()
          : err([`Couldn't find arbitraryField`]));

      const validate = all([validateIsObject, arbitraryValidator]);

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
      const validateObjectSchema = all(
        fromObjectSchema({
          field2: {
            required: true,
            type: 'string',
          },
        })
      );

      const validateLteThree = n =>
        (n <= 3 ? ok() : err([`${n} was greater than 3`]));

      const validateArraySchema = all(
        fromArraySchema({
          type: 'number',
          validator: validateLteThree,
        })
      );

      const validate = all(
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
      // expect(isErr(validate({ field1: 'here', field4: 'also here' }))).to.be
      //   .true;
      expect(isErr(validate({ field1: 'here', field3: [1, 2, 3] }))).to.be.true;

      expect(isOK(validate({ field1: 'here' }))).to.be.true;
      expect(isOK(validate({ field1: 'here', field2: 6 }))).to.be.true;
      expect(isOK(validate({ field1: 'here', field2: 6, field3: [{ a: 1 }] })))
        .to.be.true;
    });
  });

  describe('#arrayValidator()', () => {
    it('exports a pre-composed helper for arrays', () => {
      const hasFewerThan3Keys = o =>
        (Object.keys(o).length < 3 ? ok() : err([`Object has too many keys`]));

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
  });
});
