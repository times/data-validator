const { expect } = require('chai');
const { validateIsObject, validateIsArray } = require('../lib/validators');
const { OK, Err } = require('../lib/classes');

describe('validators', () => {
  describe('#validateIsObject()', () => {
    it('should return an Err when the given data is not an object', () => {
      const res = validateIsObject({}, 'string');
      expect(res).to.be.instanceof(Err);
      expect(res.valid).to.be.false;
      expect(res.errors).to.deep.equal([`Data was not an object`]);

      expect(validateIsObject({}, 1)).to.be.instanceof(Err);
      expect(validateIsObject({}, [])).to.be.instanceof(Err);
      expect(validateIsObject({}, new Date())).to.be.instanceof(Err);
    });

    it('should return an OK when the given data is an object', () => {
      const res = validateIsObject({}, {});
      expect(res).to.be.instanceof(OK);
      expect(res.valid).to.be.true;
      expect(res.errors).to.deep.equal([]);

      expect(validateIsObject({}, { a: 1, b: 2 })).to.be.instanceof(OK);
    });
  });

  describe('#validateIsArray()', () => {
    it('should return an Err when the given data is not an array', () => {
      const res = validateIsArray({}, 'string');
      expect(res).to.be.instanceof(Err);
      expect(res.valid).to.be.false;
      expect(res.errors).to.deep.equal([`Data was not an array`]);

      expect(validateIsArray({}, 1)).to.be.instanceof(Err);
      expect(validateIsArray({}, {})).to.be.instanceof(Err);
      expect(validateIsArray({}, new Date())).to.be.instanceof(Err);
    });

    it('should return an OK when the given data is an array', () => {
      const res = validateIsArray({}, []);
      expect(res).to.be.instanceof(OK);
      expect(res.valid).to.be.true;
      expect(res.errors).to.deep.equal([]);

      expect(validateIsArray({}, [1, 2, 3])).to.be.instanceof(OK);
    });
  });
});
