const { expect } = require('chai');
const { compose, objectValidator, arrayValidator } = require('../lib/compose');
const { isOK, isErr, ok, err } = require('../lib/result');
const {
  validateIsObject,
  validateRequiredFields,
  validateExtraFields,
  validateItemsTypecheck,
} = require('../lib/validators');

describe('compose', () => {
  describe('#compose()', () => {
    it('should compose multiple validators into a single validator', () => {
      const schema = {
        field1: {
          required: true,
        },
        field2: {
          required: false,
        },
      };

      const validate = compose(validateIsObject, validateRequiredFields)(
        schema
      );

      expect(isErr(validate('not an object'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 'here' }))).to.be.true;

      expect(isOK(validate({ field1: 'here' }))).to.be.true;
    });

    it('can compose multiple times', () => {
      const schema = {
        field1: {
          required: true,
        },
        field2: {
          required: false,
        },
      };

      const v1 = compose(validateIsObject);
      const v2 = compose(v1, validateRequiredFields);
      const v3 = compose(v2, validateExtraFields);
      const validate = v3(schema);

      expect(isErr(validate('not an object'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 'here' }))).to.be.true;
      expect(isErr(validate({ field1: 'here', field3: 'also here' }))).to.be
        .true;

      expect(isOK(validate({ field1: 'here' }))).to.be.true;
      expect(isOK(validate({ field1: 'here', field2: 'also here' }))).to.be
        .true;
    });

    it('runs the composed validators in order', () => {
      const schema = {
        field1: {
          required: true,
        },
        field2: {
          required: false,
        },
      };

      const validate = compose(
        validateIsObject,
        validateRequiredFields,
        validateExtraFields
      )(schema);

      expect(validate('not an object').errors).to.deep.equal([
        `Data was not an object`,
      ]);
      expect(validate({}).errors).to.deep.equal([
        `Missing required field "field1"`,
      ]);
      expect(validate({ field2: 'here' }).errors).to.deep.equal([
        `Missing required field "field1"`,
      ]);
      expect(
        validate({ field1: 'here', field3: 'also here' }).errors
      ).to.deep.equal([`Extra field "field3"`]);
    });

    it('can compose with a brand new validator', () => {
      const arbitraryValidator = schema => data =>
        (data.hasOwnProperty('arbitraryField')
          ? ok()
          : err([`Couldn't find arbitraryField`]));

      const validate = compose(validateIsObject, arbitraryValidator)({});

      expect(isErr(validate(''))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isOK(validate({ arbitraryField: 'boo' }))).to.be.true;
    });
  });

  describe('#objectValidator()', () => {
    it('exports a default composed validator for objects', () => {
      const schema = {
        field1: {
          required: true,
          type: 'string',
        },
        field2: {
          type: 'number',
          predicates: [
            {
              test: x => x < 10,
              onError: x => `${x} was >= 10`,
            },
          ],
        },
        field3: {
          type: 'array',
          schemaValidator: validateItemsTypecheck({ type: 'object' }),
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
    });
  });

  describe('#arrayValidator()', () => {
    it('exports a default composed validator for arrays', () => {
      const schema = {
        type: 'object',
        predicates: [
          {
            test: o => Object.keys(o).length < 3,
            onError: o => `${o} did not include abc`,
          },
        ],
        schemaValidator: validateRequiredFields({ field1: { required: true } }),
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
