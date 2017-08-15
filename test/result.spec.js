import { expect } from 'chai';
import {
  ok,
  err,
  isOK,
  isErr,
  toResult,
  mapErrors,
  prefixErrors,
  flattenResults,
  getErrors,
} from '../src/lib/result';

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
      expect(isErr(err(['Error message']))).to.be.true;

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

  describe('#mapErrors()', () => {
    it('should not change the type of the Result', () => {
      const map = mapErrors(e => 'something');

      expect(isOK(map(ok())));
      expect(isErr(map(err())));
    });

    it('should apply a function to each error in a Result', () => {
      const map = mapErrors((e, i) => `${i + 1}. ${e}`);
      const res = err(['a', 'b', 'c']);

      expect(map(res).errors).to.deep.equal(['1. a', '2. b', '3. c']);
    });
  });

  describe('#prefixErrors()', () => {
    it('should not change the type of the Result', () => {
      const map = prefixErrors('something');

      expect(isOK(map(ok())));
      expect(isErr(map(err())));
    });

    it('should prefix each error in a Result', () => {
      const map = prefixErrors('P: ');
      const res = err(['a', 'b', 'c']);

      expect(map(res).errors).to.deep.equal(['P: a', 'P: b', 'P: c']);
    });
  });

  describe('#flattenResults()', () => {
    it('should flatten an array of OKs into an OK', () => {
      const res = flattenResults([ok(), ok(), ok()]);
      expect(isOK(res)).to.be.true;
    });

    it('should flatten an array of Errs into an Err', () => {
      const res = flattenResults([err(['a']), err(['b']), err(['c'])]);
      expect(isErr(res)).to.be.true;
      expect(res.errors).to.deep.equal(['a', 'b', 'c']);
    });

    it('should flatten a mixed array of Results into an Err', () => {
      const res = flattenResults([err(['a']), ok(), err(['c'])]);
      expect(isErr(res)).to.be.true;
      expect(res.errors).to.deep.equal(['a', 'c']);
    });

    it('should flatten a mixed Results array into an Err when the Errs have no messages', () => {
      const res = flattenResults([ok(), err()]);
      expect(isErr(res)).to.be.true;
      expect(res.errors).to.deep.equal([]);
    });
  });

  describe('#getErrors()', () => {
    it('should return the errors of an Err', () => {
      const errors = getErrors(toResult(['a']));
      expect(errors).to.deep.equal(['a']);
    });
    it('should return an empty array for an OK', () => {
      const errors = getErrors(toResult([]));
      expect(errors).to.deep.equal([]);
    });
  });
});
