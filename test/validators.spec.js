const { expect } = require('chai');
const { OK, Err } = require('../lib/result');
const {
  validateIsObject,
  validateIsArray,
  validateRequiredFields,
} = require('../lib/validators');

describe('validators', () => {
  describe('#validateIsObject()', () => {
    it('should return an Err when the given data is not an object', () => {
      const res = validateIsObject({}, 'string');
      expect(res).to.be.instanceof(Err);
      expect(res.errors).to.deep.equal([`Data was not an object`]);

      expect(validateIsObject({}, 1)).to.be.instanceof(Err);
      expect(validateIsObject({}, [])).to.be.instanceof(Err);
      expect(validateIsObject({}, new Date())).to.be.instanceof(Err);
    });

    it('should return an OK when the given data is an object', () => {
      const res = validateIsObject({}, {});
      expect(res).to.be.instanceof(OK);
      expect(res.errors).to.deep.equal([]);

      expect(validateIsObject({}, { a: 1, b: 2 })).to.be.instanceof(OK);
    });
  });

  describe('#validateIsArray()', () => {
    it('should return an Err when the given data is not an array', () => {
      const res = validateIsArray({}, 'string');
      expect(res).to.be.instanceof(Err);
      expect(res.errors).to.deep.equal([`Data was not an array`]);

      expect(validateIsArray({}, 1)).to.be.instanceof(Err);
      expect(validateIsArray({}, {})).to.be.instanceof(Err);
      expect(validateIsArray({}, new Date())).to.be.instanceof(Err);
    });

    it('should return an OK when the given data is an array', () => {
      const res = validateIsArray({}, []);
      expect(res).to.be.instanceof(OK);
      expect(res.errors).to.deep.equal([]);

      expect(validateIsArray({}, [1, 2, 3])).to.be.instanceof(OK);
    });
  });

  describe('#validateRequiredFields()', () => {
    const schema = {
      field1: {
        required: true,
      },
      field2: {
        required: false,
      },
    };

    it('should return an Err when the given data is missing required fields', () => {
      const res = validateRequiredFields(schema, {
        field2: 'present and correct',
      });
      expect(res).to.be.instanceof(Err);
      expect(res.errors).to.deep.equal([`Missing required field "field1"`]);
    });

    it('should return an OK when the given data has all the required fields', () => {
      const res1 = validateRequiredFields(schema, {
        field1: 'here',
      });
      expect(res1).to.be.instanceof(OK);
      expect(res1.errors).to.deep.equal([]);

      const res2 = validateRequiredFields(schema, {
        field1: 'here',
        field2: 'also here',
      });
      expect(res2).to.be.instanceof(OK);
      expect(res2.errors).to.deep.equal([]);
    });
  });
});
