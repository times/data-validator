import { expect } from 'chai';
import { flatten } from '../src/lib/helpers';

describe('helpers', () => {
  describe('#flatten()', () => {
    it('flattens nested arrays by one level', () => {
      expect(flatten([[1], [2], [3]])).to.deep.equal([1, 2, 3]);
      expect(flatten([[1], [[2]], [3]])).to.deep.equal([1, [2], 3]);
    });
  });
});
