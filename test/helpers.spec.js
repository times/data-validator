const { expect } = require('chai');
const {
  isISOString,
  isDate,
  isObject,
  isArray,
  typechecks,
} = require('../lib/helpers');

describe('#isISOString()', () => {
  it('should fail for non-strings', () => {
    expect(isISOString(1)).to.be.false;
    expect(isISOString(new Date())).to.be.false;
    expect(isISOString({})).to.be.false;
    expect(isISOString([])).to.be.false;
  });

  it('should fail for non-ISO strings', () => {
    expect(isISOString('boo')).to.be.false;
    expect(isISOString('2017-05-03')).to.be.false;
    expect(isISOString('16:12:18.554Z')).to.be.false;
  });

  it('should succeed for ISO strings', () => {
    expect(isISOString('2017-05-03T16:12:18.554Z')).to.be.true;
  });
});

describe('#isDate()', () => {
  it('should fail for non-dates', () => {
    expect(isDate(1)).to.be.false;
    expect(isDate('not a date')).to.be.false;
    expect(isDate({})).to.be.false;
    expect(isDate([])).to.be.false;
  });

  it('should fail for non-ISO strings', () => {
    expect(isDate('2017-05-03')).to.be.false;
    expect(isDate('16:12:18.554Z')).to.be.false;
  });

  it('should succeed for dates or ISO strings', () => {
    expect(isDate(new Date())).to.be.true;
    expect(isDate('2017-05-03T16:12:18.554Z')).to.be.true;
  });
});

describe('#isObject()', () => {
  it('should fail for non-objects', () => {
    expect(isObject(1)).to.be.false;
    expect(isObject('not a date')).to.be.false;
    expect(isObject(new Date())).to.be.false;
    expect(isObject('{}')).to.be.false;

    const f = () => {};
    expect(isObject(f)).to.be.false;
  });

  it('should fail for arrays', () => {
    expect(isObject([])).to.be.false;
    expect(isObject([{}])).to.be.false;
  });

  it('should succeed for objects', () => {
    expect(isObject({})).to.be.true;
    expect(isObject({ a: 1, b: 2 })).to.be.true;
  });
});

describe('#isArray()', () => {
  it('should fail for non-arrays', () => {
    expect(isArray(2)).to.be.false;
    expect(isArray({})).to.be.false;
    expect(isArray('[]')).to.be.false;
    expect(isArray('not an array')).to.be.false;
  });

  it('should succeed for arrays', () => {
    expect(isArray([])).to.be.true;
    expect(isArray([[]])).to.be.true;
  });
});

describe('#typechecks()', () => {
  it('should fail when the value is not of the given type', () => {
    expect(typechecks(1, 'string')).to.be.false;
    expect(typechecks([], 'object')).to.be.false;
    expect(typechecks([], 'function')).to.be.false;
    expect(typechecks({}, 'array')).to.be.false;
    expect(typechecks('1', 'number')).to.be.false;
    expect(typechecks(new Date(), 'object')).to.be.false;
    expect(typechecks(new Date(), 'number')).to.be.false;

    const f = () => {};
    expect(typechecks(f, 'object')).to.be.false;
  });

  it('should succeed when the value is of the given type', () => {
    expect(typechecks(1, 'number')).to.be.true;
    expect(typechecks([], 'array')).to.be.true;
    expect(typechecks({}, 'object')).to.be.true;
    expect(typechecks('sss', 'string')).to.be.true;
    expect(typechecks(new Date(), 'date')).to.be.true;

    const f = () => {};
    expect(typechecks(f, 'function')).to.be.true;
  });
});
