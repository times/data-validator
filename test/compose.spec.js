import { expect } from 'chai';

import { all, allWhileOK, some } from '../src/lib/compose';
import { isOK, isErr, ok, err } from '../src/lib/result';
import { getErrors } from '../src/lib/printer';

import {
  validateIsObject,
  validateObjHasKey,
  validateObjPropHasType,
  validateIsArray,
} from '../src/lib/validators';

describe('compose', () => {
  describe('#allWhileOK()', () => {
    it('should compose multiple validators into a single validator such that they all must succeed', () => {
      const validate = allWhileOK([
        validateIsObject,
        validateObjHasKey('field1'),
      ]);

      expect(isErr(validate('not an object'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 'here' }))).to.be.true;

      expect(isOK(validate({ field1: 'here' }))).to.be.true;
    });

    it('can compose multiple times', () => {
      const v1 = allWhileOK([validateIsObject]);
      const v2 = allWhileOK([v1, validateObjHasKey('field1')]);
      const validate = allWhileOK([v2, validateObjHasKey('field2')]);

      expect(isErr(validate('not an object'))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isErr(validate({ field2: 'here' }))).to.be.true;
      expect(isErr(validate({ field1: 'here', field3: 'also here' }))).to.be
        .true;

      expect(isOK(validate({ field1: 'here', field2: 'also here' }))).to.be
        .true;
    });

    it('runs the composed validators in order, stopping when a failure occurs, and returns the first error', () => {
      const validate = allWhileOK([
        validateIsObject,
        validateObjHasKey('field1'),
        validateObjPropHasType('string')('field1'),
      ]);

      expect(getErrors(validate('not an object'))).to.deep.equal([
        `"not an object" failed to typecheck (expected object)`,
      ]);

      expect(getErrors(validate({}))).to.deep.equal([
        `Missing required field "field1"`,
      ]);

      expect(getErrors(validate({ field1: {} }))).to.deep.equal([
        `At field \"field1\": {} failed to typecheck (expected string)`,
      ]);

      expect(getErrors(validate({ field2: 'here' }))).to.deep.equal([
        `Missing required field "field1"`,
      ]);
    });

    it('can compose with a brand new validator', () => {
      const arbitraryValidator = data =>
        data.hasOwnProperty('arbitraryField')
          ? ok()
          : err(`Couldn't find arbitraryField`);

      const validate = allWhileOK([validateIsObject, arbitraryValidator]);

      expect(isErr(validate(''))).to.be.true;
      expect(isErr(validate({}))).to.be.true;
      expect(isOK(validate({ arbitraryField: 'boo' }))).to.be.true;
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

      expect(getErrors(validate('not an object'))).to.deep.equal([
        `"not an object" failed to typecheck (expected object)`,
        `Missing required field \"field1\"`,
      ]);

      expect(getErrors(validate({}))).to.deep.equal([
        `Missing required field "field1"`,
      ]);

      expect(getErrors(validate({ field2: 'here' }))).to.deep.equal([
        `Missing required field "field1"`,
      ]);
    });

    it('can compose with a brand new validator', () => {
      const arbitraryValidator = data =>
        data.hasOwnProperty('arbitraryField')
          ? ok()
          : err("Couldn't find arbitraryField");

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
      expect(getErrors(validate(123))).to.deep.equal([
        '123 failed to typecheck (expected object)',
        '123 failed to typecheck (expected array)',
      ]);
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
});
