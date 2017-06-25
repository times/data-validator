import { expect } from 'chai';
import { isOK, isErr } from '../src/lib/result';
import {
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateObjPropPasses,
  validateIsArray,
  validateArrayItemsHaveType,
  //   validateExtraFields,
  //   validateFieldPredicates,
  //   validateArrayPredicates,
  //   validateFieldSchemaValidators,
  //   validateArraySchemaValidator,
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

  //   describe('#validateExtraFields()', () => {
  //     const schema = {
  //       field1: {
  //         required: true,
  //       },
  //       field2: {
  //         required: false,
  //       },
  //     };

  //     const validate = validateExtraFields(schema);

  //     it('should return an Err when the given data has extra fields', () => {
  //       const res1 = validate({
  //         field1: 'present',
  //         field3: 'should not be here',
  //       });
  //       expect(isErr(res1)).to.be.true;
  //       expect(res1.errors).to.deep.equal([`Extra field "field3"`]);

  //       const res2 = validate({
  //         field1: 'present',
  //         field2: 'also present',
  //         field3: 'should not be here',
  //       });
  //       expect(isErr(res2)).to.be.true;
  //       expect(res2.errors).to.deep.equal([`Extra field "field3"`]);
  //     });

  //     it('should return an OK when the given data has no extra fields', () => {
  //       const res1 = validate({
  //         field1: 'here',
  //       });
  //       expect(isOK(res1)).to.be.true;
  //       expect(res1.errors).to.deep.equal([]);

  //       const res2 = validate({
  //         field1: 'here',
  //         field2: 'also here',
  //       });
  //       expect(isOK(res2)).to.be.true;
  //       expect(res2.errors).to.deep.equal([]);
  //     });
  //   });

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

  describe('validateArrayItemsHaveType()', () => {
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

  //   describe('#validateFieldPredicates()', () => {
  //     const schema = {
  //       field1: {
  //         predicates: [
  //           {
  //             test: x => x < 10,
  //             onError: x => `${x} was >= 10`,
  //           },
  //         ],
  //       },
  //     };

  //     const validate = validateFieldPredicates(schema);

  //     it('should return an Err when the data object has fields that do not pass their predicates', () => {
  //       const res = validate({
  //         field1: 11,
  //       });
  //       expect(isErr(res)).to.be.true;
  //       expect(res.errors).to.deep.equal([`11 was >= 10`]);
  //     });

  //     it("should return an OK when the data object's fields all pass their predicates", () => {
  //       const res1 = validate({
  //         field1: 9,
  //       });
  //       expect(isOK(res1)).to.be.true;
  //       expect(res1.errors).to.deep.equal([]);

  //       const res2 = validate({
  //         field1: 9,
  //         field2: 100,
  //       });
  //       expect(isOK(res2)).to.be.true;
  //       expect(res2.errors).to.deep.equal([]);
  //     });

  //     it('should return an OK when there are no predicates', () => {
  //       const res = validateFieldPredicates({ field1: { predicates: [] } })({
  //         field1: 'empty',
  //       });
  //       expect(isOK(res)).to.be.true;
  //     });

  //     it('should return an OK when there are no predicates #2', () => {
  //       const res = validateFieldPredicates({ field1: {} })({
  //         field1: 'empty',
  //       });
  //       expect(isOK(res)).to.be.true;
  //     });
  //   });

  //   describe('#validateArrayPredicates()', () => {
  //     const schema = {
  //       predicates: [
  //         {
  //           test: s => s.includes('abc'),
  //           onError: s => `${s} did not include abc`,
  //         },
  //       ],
  //     };

  //     const validate = validateArrayPredicates(schema);

  //     it('should return an Err when the array has items that do not pass the predicates', () => {
  //       const res = validate(['abc', 'xyz']);
  //       expect(isErr(res)).to.be.true;
  //       expect(res.errors).to.deep.equal([`xyz did not include abc`]);
  //     });

  //     it("should return an OK when the array item's all pass the predicates", () => {
  //       const res = validate(['abc1', 'abc2', '123abc']);
  //       expect(isOK(res)).to.be.true;
  //       expect(res.errors).to.deep.equal([]);
  //     });

  //     it('should return an OK when there are no predicates', () => {
  //       const res = validateArrayPredicates({ predicates: [] })([1, 2, 3]);
  //       expect(isOK(res)).to.be.true;
  //     });

  //     it('should return an OK when there are no predicates #2', () => {
  //       const res = validateArrayPredicates({})([1, 2, 3]);
  //       expect(isOK(res)).to.be.true;
  //     });
  //   });

  //   describe('#validateFieldSchemaValidators()', () => {
  //     describe('objects inside objects', () => {
  //       const nestedSchema = {
  //         field1a: {
  //           required: true,
  //         },
  //         field1b: {
  //           required: false,
  //         },
  //       };

  //       const schema1 = {
  //         field1: {
  //           schemaValidator: validateRequiredFields(nestedSchema),
  //         },
  //       };

  //       const schema2 = {
  //         field1: {
  //           schemaValidator: validateExtraFields(nestedSchema),
  //         },
  //       };

  //       const validate1 = validateFieldSchemaValidators(schema1);
  //       const validate2 = validateFieldSchemaValidators(schema2);

  //       it('should return an Err when a nested field schemaValidator does not pass', () => {
  //         const res1 = validate1({
  //           field1: {},
  //         });
  //         expect(isErr(res1)).to.be.true;
  //         expect(res1.errors).to.deep.equal([
  //           `At field "field1": Missing required field "field1a"`,
  //         ]);

  //         const res2 = validate2({
  //           field1: {
  //             field1c: 'should not be here',
  //           },
  //         });
  //         expect(isErr(res2)).to.be.true;
  //         expect(res2.errors).to.deep.equal([
  //           `At field "field1": Extra field "field1c"`,
  //         ]);
  //       });

  //       it('should return an OK when all nested field schemaValidators pass', () => {
  //         const res1 = validate1({
  //           field1: {
  //             field1a: 'here',
  //           },
  //         });
  //         expect(isOK(res1)).to.be.true;
  //         expect(res1.errors).to.deep.equal([]);

  //         const res2 = validate1({
  //           field1: {
  //             field1a: 'here',
  //             field1b: 'also here',
  //           },
  //         });
  //         expect(isOK(res2)).to.be.true;
  //         expect(res2.errors).to.deep.equal([]);

  //         const res3 = validate2({
  //           field1: {
  //             field1a: 'here',
  //           },
  //         });
  //         expect(isOK(res3)).to.be.true;
  //         expect(res3.errors).to.deep.equal([]);
  //       });
  //     });

  //     describe('arrays inside objects', () => {
  //       const nestedSchema = {
  //         predicates: [
  //           {
  //             test: s => s.includes('abc'),
  //             onError: s => `${s} did not include abc`,
  //           },
  //         ],
  //       };

  //       const schema = {
  //         arrayField: {
  //           schemaValidator: validateArrayPredicates(nestedSchema),
  //         },
  //       };

  //       const validate = validateFieldSchemaValidators(schema);

  //       it('should return an Err when items in the nested array do not pass the schemaValidator', () => {
  //         const res = validate({
  //           arrayField: ['abc', 'xyz'],
  //         });
  //         expect(isErr(res)).to.be.true;
  //         expect(res.errors).to.deep.equal([
  //           `At field "arrayField": xyz did not include abc`,
  //         ]);
  //       });

  //       it('should return an OK when all nested array schema validators pass', () => {
  //         const res = validate({
  //           arrayField: ['abc1', 'abc2', '123abc'],
  //         });
  //         expect(isOK(res)).to.be.true;
  //         expect(res.errors).to.deep.equal([]);
  //       });
  //     });

  //     describe('arrays inside arrays', () => {
  //       const nestedSchema = {
  //         predicates: [
  //           {
  //             test: x => x > 10,
  //             onError: x => `${x} was <= 10`,
  //           },
  //         ],
  //       };

  //       const schema = {
  //         schemaValidator: validateArrayPredicates(nestedSchema),
  //       };

  //       const validate = validateArraySchemaValidator(schema);

  //       it('should return an Err when a nested array schemaValidator does not pass', () => {
  //         const res = validate([[1, 20], [3, 40]]);
  //         expect(isErr(res)).to.be.true;
  //         expect(res.errors).to.deep.equal([
  //           `At item 0: 1 was <= 10`,
  //           `At item 1: 3 was <= 10`,
  //         ]);
  //       });

  //       it('should return an OK when all nested array schema validators pass', () => {
  //         const res = validate([[11, 20], [30, 40]]);
  //         expect(isOK(res)).to.be.true;
  //         expect(res.errors).to.deep.equal([]);
  //       });

  //       it('should return an OK when there are no nested schema validators', () => {
  //         const res = validateArraySchemaValidator({})([]);
  //         expect(isOK(res)).to.be.true;
  //       });
  //     });

  //     describe('objects inside arrays', () => {
  //       const nestedSchema = {
  //         field1: {
  //           type: 'number',
  //         },
  //       };

  //       const schema = {
  //         schemaValidator: validateObjPropHasType(nestedSchema),
  //       };

  //       const validate = validateArraySchemaValidator(schema);

  //       it('should return an Err when a nested object schemaValidator does not pass', () => {
  //         const res = validate([{ field1: 123 }, { field1: '123' }]);
  //         expect(isErr(res)).to.be.true;
  //         expect(res.errors).to.deep.equal([
  //           `At item 1: Field "field1" failed to typecheck (expected number)`,
  //         ]);
  //       });

  //       it('should return an OK when all nested object schema validators pass', () => {
  //         const res = validate([{ field1: 123 }, { field1: 456 }]);
  //         expect(isOK(res)).to.be.true;
  //         expect(res.errors).to.deep.equal([]);
  //       });
  //     });
  //   });
});
