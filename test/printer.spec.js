import { expect } from 'chai';

import { printVerbose } from '../src/lib/printer';

describe.only('printer', () => {
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
