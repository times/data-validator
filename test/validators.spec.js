import { expect } from 'chai';
import { isOK, isErr, ok, err } from '../src/lib/result';
import {
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateObjPropPasses,
  validateObjOnlyHasKeys,
  validateIsArray,
  validateArrayItemsHaveType,
  validateArrayItemsPass,
  alwaysErr,
} from '../src/lib/validators';

describe('validators', () => {
  describe('#validateIsObject()', () => {
    it('should return an Err when the given data is not an object', () => {
      const res = validateIsObject('string');
      expect(isErr(res)).to.be.true;
      expect(res.errors).to.deep.equal([`Data was not an object`]);

      expect(isErr(validateIsObject(1))).to.be.true;
      expect(isErr(validateIsObject([]))).to.be.true;
      expect(isErr(validateIsObject(new Date()))).to.be.true;
    });

    it('should return an OK when the given data is an object', () => {
      const res = validateIsObject({});
      expect(isOK(res)).to.be.true;
      expect(res.errors).to.deep.equal([]);

      expect(isOK(validateIsObject({ a: 1, b: 2 }))).to.be.true;
    });
  });

  describe('#validateObjHasKey()', () => {
    it('should return an Err when the given data is missing required fields', () => {
      const res = validateObjHasKey('field1')({
        field2: 'present and correct',
      });
      expect(isErr(res)).to.be.true;
      expect(res.errors).to.deep.equal([`Missing required field "field1"`]);
    });

    it('should return an OK when the given data has all the required fields', () => {
      const res1 = validateObjHasKey('field1')({
        field1: 'here',
      });
      expect(isOK(res1)).to.be.true;
      expect(res1.errors).to.deep.equal([]);
    });
  });

  describe('#validateObjPropHasType()', () => {
    it('should return an Err when the given data has fields that do not typecheck', () => {
      const res1 = validateObjPropHasType('string')('field1')({
        field1: 123,
      });
      expect(isErr(res1)).to.be.true;
      expect(res1.errors).to.deep.equal([
        `Field "field1" failed to typecheck (expected string)`,
      ]);

      const res2 = validateObjPropHasType('number')('field2')({
        field1: 'a string',
        field2: 'not a number',
      });
      expect(isErr(res2)).to.be.true;
      expect(res2.errors).to.deep.equal([
        `Field "field2" failed to typecheck (expected number)`,
      ]);
    });

    it("should return an OK when the given data's fields all typecheck", () => {
      const res = validateObjPropHasType('string')('field1')({
        field1: 'a string',
        field2: 12345,
      });
      expect(isOK(res)).to.be.true;
      expect(res.errors).to.deep.equal([]);
    });

    it("should return an OK for fields that don't specify a type", () => {
      const res1 = validateObjPropHasType('string')('field1')({
        field3: 'a string',
      });
      expect(isOK(res1)).to.be.true;

      const res2 = validateObjPropHasType('string')('field1')({
        field3: 123,
      });
      expect(isOK(res2)).to.be.true;
    });
  });

  describe('#validateObjPropPasses()', () => {
    it('should check the given field validator passes', () => {
      const res1 = validateObjPropPasses(validateIsArray)('field1')({
        field1: 123,
      });
      expect(isErr(res1)).to.be.true;
      expect(res1.errors).to.deep.equal([
        `At field "field1": Data was not an array`,
      ]);

      const res2 = validateObjPropPasses(validateIsArray)('field1')({
        field1: [1, 2, 3],
      });
      expect(isOK(res2)).to.be.true;
    });

    it('should return OK if the given field is not present', () => {
      const res = validateObjPropPasses(validateIsArray)('field1')({
        field2: 123,
      });
      expect(isOK(res)).to.be.true;
    });
  });

  describe('#validateObjOnlyHasKeys', () => {
    const schema = {
      field1: {},
      field2: {},
    };

    const validate = validateObjOnlyHasKeys(Object.keys(schema));

    it('should return an Err when the given data has extra fields', () => {
      const res1 = validate({
        field1: 'present',
        field3: 'should not be here',
      });
      expect(isErr(res1)).to.be.true;
      expect(res1.errors).to.deep.equal([`Extra field "field3"`]);

      const res2 = validate({
        field1: 'present',
        field2: 'also present',
        field3: 'should not be here',
      });
      expect(isErr(res2)).to.be.true;
      expect(res2.errors).to.deep.equal([`Extra field "field3"`]);
    });

    it('should return an OK when the given data has no extra fields', () => {
      const res1 = validate({
        field1: 'here',
      });
      expect(isOK(res1)).to.be.true;
      expect(res1.errors).to.deep.equal([]);

      const res2 = validate({
        field1: 'here',
        field2: 'also here',
      });
      expect(isOK(res2)).to.be.true;
      expect(res2.errors).to.deep.equal([]);
    });
  });

  describe('#validateIsArray()', () => {
    it('should return an Err when the given data is not an array', () => {
      const res = validateIsArray('string');
      expect(isErr(res)).to.be.true;
      expect(res.errors).to.deep.equal([`Data was not an array`]);

      expect(isErr(validateIsArray(1))).to.be.true;
      expect(isErr(validateIsArray({}))).to.be.true;
      expect(isErr(validateIsArray(new Date()))).to.be.true;
    });

    it('should return an OK when the given data is an array', () => {
      const res = validateIsArray([]);
      expect(isOK(res)).to.be.true;
      expect(res.errors).to.deep.equal([]);

      expect(isOK(validateIsArray([1, 2, 3]))).to.be.true;
    });
  });

  describe('#validateArrayItemsHaveType()', () => {
    it('should return an Err when the given array has items that do not typecheck', () => {
      const validate = validateArrayItemsHaveType('string');

      const res1 = validate([1, '2', '3']);
      expect(isErr(res1)).to.be.true;
      expect(res1.errors).to.deep.equal([
        `Item "1" failed to typecheck (expected string)`,
      ]);

      const res2 = validate(['1', true]);
      expect(isErr(res2)).to.be.true;
      expect(res2.errors).to.deep.equal([
        `Item "true" failed to typecheck (expected string)`,
      ]);
    });

    it("should return an OK when the given array's items all typecheck", () => {
      const validate = validateArrayItemsHaveType('string');

      const res = validate(['1', '2']);
      expect(isOK(res)).to.be.true;
      expect(res.errors).to.deep.equal([]);
    });
  });

  describe('#validateArrayItemsPass()', () => {
    const validate = validateArrayItemsPass(
      n => (n > 3 ? ok() : err([`${n} <= 3`]))
    );

    it('should return an Err if any of the items fail the given validator', () => {
      const res = validate([2, 3, 4]);
      expect(isErr(res)).to.be.true;
      expect(res.errors).to.deep.equal([
        `At item 0: 2 <= 3`,
        `At item 1: 3 <= 3`,
      ]);
    });

    it('should return OK if all the items pass the given validator', () => {
      const res = validate([4, 5, 6]);
      expect(isOK(res)).to.be.true;
    });
  });

  describe('#alwaysErr()', () => {
    it('should return a validator that always errors', () => {
      const validate = alwaysErr(['Error one', 'Error two']);

      expect(isErr(validate())).to.be.true;
      expect(isErr(validate({ test: '1234' }))).to.be.true;
      expect(isErr(validate([1, 2, 3]))).to.be.true;
    });

    it('should return a the error passed into it', () => {
      const errors = ['Error one', 'Error two'];

      const validate = alwaysErr(errors);

      expect(validate().errors).to.deep.equal(errors);
    });
  });
});
