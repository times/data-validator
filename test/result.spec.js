import { expect } from 'chai';
import {
  ok,
  err,
  nestedErr,
  isOK,
  isErr,
  mapErrors,
  mergeResults,
  concatResults,
} from '../src/lib/result';

import { getErrors } from '../src/lib/printer';

describe('result', () => {
  describe('#ok()', () => {
    it('constructs an OK object', () => {
      expect(ok()).to.deep.equal({ valid: true });
    });
  });

  describe('#err()', () => {
    it('does not require an error', () => {
      expect(err()).to.deep.equal({ valid: false, errors: [] });
    });

    it('constructs an Err object from an array of errors', () => {
      expect(err(['err1', 'err2'])).to.deep.equal({
        valid: false,
        errors: ['err1', 'err2'],
      });
    });

    it('constructs an Err object from a single error', () => {
      expect(err('err1')).to.deep.equal({ valid: false, errors: ['err1'] });
    });
  });

  describe('#nestedErr()', () => {
    it('constructs an Err object with nested errors', () => {
      expect(nestedErr('object', { a: 'err1' })).to.deep.equal({
        valid: false,
        errors: [],
        type: 'object',
        items: { a: 'err1' },
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
      expect(isErr(err('Error message'))).to.be.true;

      expect(isErr(ok())).to.be.false;
      expect(isErr({})).to.be.false;
      expect(isErr([])).to.be.false;
      expect(isErr(new Date())).to.be.false;
    });
  });

  describe('#mapErrors()', () => {
    it('should not change the type of the Result', () => {
      const map = mapErrors(e => 'something');

      expect(isOK(map(ok())));
      expect(isErr(map(err())));
    });

    it('should apply a function to each top-level error in a Result', () => {
      const map = mapErrors((e, i) => `${i + 1}. ${e}`);
      const res = err(['a', 'b', 'c']);

      expect(getErrors(map(res))).to.deep.equal(['1. a', '2. b', '3. c']);
    });

    it('should apply a function to each nested item in a Result', () => {
      const map = mapErrors(e => `got ${e}`);
      const res = nestedErr('object', { a: err('a'), b: ok(), c: err('c') });

      expect(getErrors(map(res))).to.deep.equal(['got a', 'got c']);
    });
  });

  describe('#mergeResults()', () => {
    it('should merge two OKs into an OK', () => {
      const res = mergeResults(ok(), ok());
      expect(isOK(res)).to.be.true;
    });

    it('should merge two Errs into an Err', () => {
      const res = mergeResults(err(['a']), err(['b']));
      expect(isErr(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal(['a', 'b']);
    });

    it('should merge an OK and an Err into an Err', () => {
      const res = mergeResults(err(['a']), ok());
      expect(isErr(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal(['a']);
    });
  });

  describe('#concatResults()', () => {
    it('should fold an array of OKs into an OK', () => {
      const res = concatResults([ok(), ok(), ok()]);
      expect(isOK(res)).to.be.true;
    });

    it('should fold an array of Errs into an Err', () => {
      const res = concatResults([err(['a']), err(['b']), err(['c'])]);
      expect(isErr(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal(['a', 'b', 'c']);
    });

    it('should fold a mixed array of Results into an Err', () => {
      const res = concatResults([err(['a']), ok(), err(['c'])]);
      expect(isErr(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal(['a', 'c']);
    });

    it('should fold a mixed Results array into an Err when the Errs have no messages', () => {
      const res = concatResults([ok(), err()]);
      expect(isErr(res)).to.be.true;
      expect(getErrors(res)).to.deep.equal([]);
    });
  });
});
