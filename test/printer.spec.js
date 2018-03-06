import { expect } from 'chai';

import {
  ok,
  err,
  isOK,
  isErr,
  mergeResults,
  concatResults,
  mapErrors,
  allWhileOK,
  all,
  valStrLen,
  valStrStartsWith,
  valStr,
  printVerbose,
  getErrors
} from '../src/lib/printer';

describe.only('printer', () => {
  describe.only('#', () => {
    it(`constructs valid and invalid results`, () => {
      expect(isOK(ok())).to.be.true;
      expect(isOK(err('x', 'err'))).to.be.false;

      expect(isErr(ok())).to.be.false;
      expect(isErr(err('x', 'err'))).to.be.true;
    });

    it('merges two results', () => {
      const r1 = ok();
      const r2 = err('x', 'err1');
      const r3 = err('x', 'err2');

      const m1 = mergeResults(r1, r2);
      expect(getErrors(m1)).to.deep.equal(['err1']);

      const m2 = mergeResults(r2, r3);
      expect(getErrors(m2)).to.deep.equal(['err1', 'err2']);
    });

    it('concats results', () => {
      const r1 = ok();
      const r2 = err('x', 'err1');
      const r3 = err('x', 'err2');

      expect(getErrors(concatResults([r1, r2, r3]))).to.deep.equal([
        'err1',
        'err2'
      ]);

      expect(getErrors(concatResults([ok(), ok()]))).to.deep.equal([]);
    });

    it('composes allWhileOK', () => {
      const v = allWhileOK([valStrLen, valStrStartsWith('a')]);

      expect(getErrors(v('xyz'))).to.deep.equal(['Length < 5']);
      expect(getErrors(v('xyz123'))).to.deep.equal(['Expected a (got x)']);
      expect(isOK(v('abc123'))).to.be.true;
    });

    it('composes all', () => {
      const v = all([valStrLen, valStrStartsWith('a')]);

      expect(getErrors(v('xyz'))).to.deep.equal([
        'Length < 5',
        'Expected a (got x)'
      ]);

      expect(isOK(v('abc123'))).to.be.true;
    });

    it('maps errors', () => {
      const mapper = mapErrors(e => `*** ${e}`);
      expect(getErrors(mapper(ok()))).to.deep.equal([]);
      expect(getErrors(mapper(err('x', ['err'])))).to.deep.equal(['*** err']);
    });
  });

  describe('#printVerbose()', () => {
    it('should print an error', () => {
      const ast = {
        type: 'string',
        value: 'abc',
        errors: ['error1']
      };

      expect(printVerbose(ast)).to.deep.equal(['error1']);
    });

    it('should print an array of errors', () => {
      const ast = {
        type: 'array',
        value: ['a', 'b', 'c'],
        errors: [],
        items: {
          0: {
            type: 'string',
            value: 'a',
            errors: ['error1']
          },
          1: {
            type: 'string',
            value: 'b',
            errors: []
          },
          2: {
            type: 'string',
            value: 'c',
            errors: ['error2']
          }
        }
      };

      expect(printVerbose(ast)).to.deep.equal([
        'At item 0: error1',
        'At item 2: error2'
      ]);
    });

    it('should print an object of errors', () => {
      const ast = {
        type: 'object',
        value: { a: 1, b: 2, c: { d: 3 } },
        errors: [],
        items: {
          a: {
            type: 'number',
            value: 1,
            errors: ['error1']
          },
          b: {
            type: 'number',
            value: 2,
            errors: []
          },
          c: {
            type: 'object',
            value: { d: 3 },
            errors: [],
            items: {
              d: {
                type: 'number',
                value: 3,
                errors: ['error2']
              }
            }
          }
        }
      };

      expect(printVerbose(ast)).to.deep.equal([
        'At field a: error1',
        'At field c: at field d: error2'
      ]);
    });

    it('should print a complex object of errors', () => {
      const ast = {
        type: 'object',
        value: { a: { b: ['c', { d: 'e' }] } },
        errors: [],
        items: {
          a: {
            type: 'object',
            value: { b: ['c', { d: 'e' }] },
            errors: [],
            items: {
              b: {
                type: 'array',
                value: ['c', { d: 'e' }],
                errors: [],
                items: {
                  0: {
                    type: 'string',
                    value: 'c',
                    errors: ['error1']
                  },
                  1: {
                    type: 'object',
                    value: { d: 'e' },
                    errors: [],
                    items: {
                      d: {
                        type: 'string',
                        value: 'e',
                        errors: ['error2']
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      expect(printVerbose(ast)).to.deep.equal([
        'At field a: at field b: at item 0: error1',
        'At field a: at field b: at item 1: at field d: error2'
      ]);
    });
  });
});
