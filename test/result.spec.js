import { expect } from 'chai';
import { ok, err, isOK, isErr, toResult } from '../src/lib/result';

describe('result', () => {
  describe('#ok()', () => {
    it('constructs an OK object', () => {
      expect(ok()).to.deep.equal({
        valid: true,
        errors: [],
      });
    });
  });

  describe('#err()', () => {
    it('constructs an Err object', () => {
      expect(err()).to.deep.equal({
        valid: false,
        errors: [],
      });

      expect(err(['err1', 'err2'])).to.deep.equal({
        valid: false,
        errors: ['err1', 'err2'],
      });
    });
  });

  describe('#isOK()', () => {
    it('returns true only for an OK object', () => {
      expect(isOK(ok())).to.be.true;

      expect(isOK(err())).to.be.false;
      expect(isOK({})).to.be.false;
      expect(isOK([])).to.be.false;
      expect(isOK(new Date())).to.be.false;
    });
  });

  describe('#isErr()', () => {
    it('returns true only for an Err object', () => {
      expect(isErr(err())).to.be.true;

      expect(isErr(ok())).to.be.false;
      expect(isErr({})).to.be.false;
      expect(isErr([])).to.be.false;
      expect(isErr(new Date())).to.be.false;
    });
  });

  describe('#toResult()', () => {
    it('constructs an OK object from an empty array', () => {
      expect(isOK(toResult([]))).to.be.true;
      expect(isOK(toResult(['abc']))).to.be.false;
    });

    it('constructs an Err object from a non-empty array', () => {
      expect(isErr(toResult([]))).to.be.false;
      expect(isErr(toResult(['abc']))).to.be.true;
    });
  });
});
