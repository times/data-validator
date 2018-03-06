import { expect } from 'chai';
import { getErrors } from '../src/lib/printer';
import { isOK, isErr, ok, err } from '../src/lib/result';
import {
  alwaysErr,
  alwaysOK,
  fromPredicate,
  validateIsType,
  validateIsIn,
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateObjPropPasses,
  validateObjOnlyHasKeys,
  validateIsArray,
  validateArrayItemsHaveType,
  validateArrayItemsPass
} from '../src/lib/validators';

describe('validators', () => {
  describe('#alwaysErr()', () => {
    it('should return a validator that always errors', () => {
      const validate = alwaysErr(['Error one', 'Error two']);

      expect(isErr(validate())).to.be.true;
      expect(isErr(validate({ test: '1234' }))).to.be.true;
      expect(isErr(validate([1, 2, 3]))).to.be.true;
    });

    it('should return the errors passed into it', () => {
      const errors = ['Error one', 'Error two'];

      const validate = alwaysErr(errors);

      expect(getErrors(validate())).to.deep.equal(errors);
    });
  });

  describe('#alwaysOK()', () => {
    it('should return a validator that always succeeds', () => {
      const validate = alwaysOK();

      expect(isOK(validate())).to.be.true;
      expect(isOK(validate({ test: '1234' }))).to.be.true;
      expect(isOK(validate([1, 2, 3]))).to.be.true;
    });
  });

  describe('#fromPredicate()', () => {
    it('constructs a validator that returns an OK if the test function passes', () => {
      const validate = fromPredicate(x => x === 10, x => `${x} was not 10`);

      expect(isOK(validate(10))).to.be.true;
      expect(isErr(validate(15))).to.be.true;
    });

    it('constructs a validator that returns an Err using the given error function if the test function fails', () => {
      const validate = fromPredicate(x => x === 10, x => `${x} was not 10`);

      expect(getErrors(validate(15))).to.deep.equal(['15 was not 10']);
    });
  });

  describe('#validateIsType()', () => {
    it('should return an Err when the given data is not of the given type', () => {
      const validate = validateIsType('string');

      const res = validate(123);
      expect(isErr(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal([
        `"123" failed to typecheck (expected string)`
      ]);

      expect(isErr(validateIsType('null')(true))).to.be.true;
      expect(isErr(validateIsType('number')('123'))).to.be.true;
    });

    it('should return OK when the given data is of the correct type', () => {
      expect(isOK(validateIsType('boolean')(false))).to.be.true;
      expect(isOK(validateIsType('number')(123))).to.be.true;
      expect(isOK(validateIsType('string')('sss'))).to.be.true;
    });
  });

  describe('#validateIsIn()', () => {
    it('should return an Err when the value is not in the provided array', () => {
      const validate = validateIsIn([1, 2, 3, 4, 5]);
      expect(isErr(validate(-5))).to.be.true;
      expect(isErr(validate(0))).to.be.true;
      expect(isErr(validate('1'))).to.be.true;
      expect(isErr(validate(6))).to.be.true;

      expect(getErrors(validate(6))).to.deep.equal([
        `Value must be one of 1, 2, 3, 4, 5 (got "6")`
      ]);
    });

    it('should return OK when the value is in the provided array', () => {
      const validate = validateIsIn([1, 2, 3, 4, 5]);
      expect(isOK(validate(1))).to.be.true;
      expect(isOK(validate(5))).to.be.true;
    });
  });

  describe('#validateIsObject()', () => {
    it('should return an Err when the given data is not an object', () => {
      const res = validateIsObject('string');
      expect(isErr(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal([
        `"string" failed to typecheck (expected object)`
      ]);

      expect(isErr(validateIsObject(1))).to.be.true;
      expect(isErr(validateIsObject([]))).to.be.true;
      expect(isErr(validateIsObject(new Date()))).to.be.true;
    });

    it('should return an OK when the given data is an object', () => {
      const res = validateIsObject({});
      expect(isOK(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal([]);

      expect(isOK(validateIsObject({ a: 1, b: 2 }))).to.be.true;
    });
  });

  describe('#validateObjHasKey()', () => {
    it('should return an Err when the given data is missing required fields', () => {
      const res = validateObjHasKey('field1')({
        field2: 'present and correct'
      });
      expect(isErr(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal([`Missing required field "field1"`]);
    });

    it('should return an OK when the given data has all the required fields', () => {
      const res1 = validateObjHasKey('field1')({
        field1: 'here'
      });
      expect(isOK(res1)).to.be.true;
      expect(getErrors(res1)).to.deep.equal([]);
    });
  });

  describe('#validateObjPropHasType()', () => {
    it('should return an Err when the given data has fields that do not typecheck', () => {
      const res1 = validateObjPropHasType('string')('field1')({
        field1: 123
      });
      expect(isErr(res1)).to.be.true;
      expect(getErrors(res1)).to.deep.equal([
        `Field "field1" failed to typecheck (expected string)`
      ]);

      const res2 = validateObjPropHasType('number')('field2')({
        field1: 'a string',
        field2: 'not a number'
      });
      expect(isErr(res2)).to.be.true;
      expect(getErrors(res2)).to.deep.equal([
        `Field "field2" failed to typecheck (expected number)`
      ]);
    });

    it("should return an OK when the given data's fields all typecheck", () => {
      const res = validateObjPropHasType('string')('field1')({
        field1: 'a string',
        field2: 12345
      });
      expect(isOK(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal([]);
    });

    it("should return an OK for fields that don't specify a type", () => {
      const res1 = validateObjPropHasType('string')('field1')({
        field3: 'a string'
      });
      expect(isOK(res1)).to.be.true;

      const res2 = validateObjPropHasType('string')('field1')({
        field3: 123
      });
      expect(isOK(res2)).to.be.true;
    });
  });

  describe('#validateObjPropPasses()', () => {
    it('should check the given field validator passes', () => {
      const res1 = validateObjPropPasses(validateIsArray)('field1')({
        field1: 123
      });
      expect(isErr(res1)).to.be.true;
      expect(getErrors(res1)).to.deep.equal([
        `At field "field1": "123" failed to typecheck (expected array)`
      ]);

      const res2 = validateObjPropPasses(validateIsArray)('field1')({
        field1: [1, 2, 3]
      });
      expect(isOK(res2)).to.be.true;
    });

    it('should return OK if the given field is not present', () => {
      const res = validateObjPropPasses(validateIsArray)('field1')({
        field2: 123
      });
      expect(isOK(res)).to.be.true;
    });
  });

  describe('#validateObjOnlyHasKeys', () => {
    const schema = {
      field1: {},
      field2: {}
    };

    const validate = validateObjOnlyHasKeys(Object.keys(schema));

    it('should return an Err when the given data has extra fields', () => {
      const res1 = validate({
        field1: 'present',
        field3: 'should not be here'
      });
      expect(isErr(res1)).to.be.true;
      expect(getErrors(res1)).to.deep.equal([`Extra field "field3"`]);

      const res2 = validate({
        field1: 'present',
        field2: 'also present',
        field3: 'should not be here'
      });
      expect(isErr(res2)).to.be.true;
      expect(getErrors(res2)).to.deep.equal([`Extra field "field3"`]);
    });

    it('should return an OK when the given data has no extra fields', () => {
      const res1 = validate({
        field1: 'here'
      });
      expect(isOK(res1)).to.be.true;
      expect(getErrors(res1)).to.deep.equal([]);

      const res2 = validate({
        field1: 'here',
        field2: 'also here'
      });
      expect(isOK(res2)).to.be.true;
      expect(getErrors(res2)).to.deep.equal([]);
    });
  });

  describe('#validateIsArray()', () => {
    it('should return an Err when the given data is not an array', () => {
      const res = validateIsArray('string');
      expect(isErr(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal([
        `"string" failed to typecheck (expected array)`
      ]);

      expect(isErr(validateIsArray(1))).to.be.true;
      expect(isErr(validateIsArray({}))).to.be.true;
      expect(isErr(validateIsArray(new Date()))).to.be.true;
    });

    it('should return an OK when the given data is an array', () => {
      const res = validateIsArray([]);
      expect(isOK(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal([]);

      expect(isOK(validateIsArray([1, 2, 3]))).to.be.true;
    });
  });

  describe('#validateArrayItemsHaveType()', () => {
    it('should return an Err when the given array has items that do not typecheck', () => {
      const validate = validateArrayItemsHaveType('string');

      const res1 = validate([1, '2', '3']);
      expect(isErr(res1)).to.be.true;
      expect(getErrors(res1)).to.deep.equal([
        `Item "1" failed to typecheck (expected string)`
      ]);

      const res2 = validate(['1', true]);
      expect(isErr(res2)).to.be.true;
      expect(getErrors(res2)).to.deep.equal([
        `Item "true" failed to typecheck (expected string)`
      ]);
    });

    it("should return an OK when the given array's items all typecheck", () => {
      const validate = validateArrayItemsHaveType('string');

      const res = validate(['1', '2']);
      expect(isOK(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal([]);
    });
  });

  describe('#validateArrayItemsPass()', () => {
    const validate = validateArrayItemsPass(
      n => (n > 3 ? ok() : err([`${n} <= 3`]))
    );

    it('should return an Err if any of the items fail the given validator', () => {
      const res = validate([2, 3, 4]);
      expect(isErr(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal([
        `At item 0: 2 <= 3`,
        `At item 1: 3 <= 3`
      ]);
    });

    it('should return OK if all the items pass the given validator', () => {
      const res = validate([4, 5, 6]);
      expect(isOK(res)).to.be.true;
    });
  });
});
