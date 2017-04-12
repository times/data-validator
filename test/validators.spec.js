const { expect } = require('chai');
const {
  objectValidator,
  arrayValidator,
} = require('../lib/validators');

describe('#objectValidator()', () => {
  const testSchema = {
    category: {
      type: 'string',
      required: true,
    },
    children: {
      type: 'array',
      required: false,
    },
    data: {
      type: 'object',
      required: true,
    },
  };

  const isValid = objectValidator(testSchema);

  it('should return errors if the passed data is not an object', () => {
    const data1 = 12345;

    expect(isValid(data1)).to.deep.equal({
      valid: false,
      errors: ['Data was not an object'],
    });

    const data2 = 'not an object';

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: ['Data was not an object'],
    });

    const data3 = ['still not an object'];

    expect(isValid(data3)).to.deep.equal({
      valid: false,
      errors: ['Data was not an object'],
    });
  });

  it('should return errors if not all required fields are present', () => {
    const data1 = {};

    expect(isValid(data1)).to.deep.equal({
      valid: false,
      errors: [
        'Missing required field "category"',
        'Missing required field "data"',
      ],
    });

    const data2 = {
      category: 'edition',
    };

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: ['Missing required field "data"'],
    });
  });

  it('should return errors if extra fields are present', () => {
    const data1 = {
      category: 'edition',
      data: {},
      extraField: '',
    };

    expect(isValid(data1)).to.deep.equal({
      valid: false,
      errors: ['Extra field "extraField"'],
    });

    const data2 = {
      category: 'edition',
      data: {},
      children: [],
      anotherField: '',
    };

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: ['Extra field "anotherField"'],
    });

    const data3 = {
      category: 'edition',
      data: {},
      children: [],
      extraField1: '',
      extraField2: 1234,
    };

    expect(isValid(data3)).to.deep.equal({
      valid: false,
      errors: ['Extra field "extraField1"', 'Extra field "extraField2"'],
    });
  });

  it('should return false when required fields have the wrong types', () => {
    const data1 = {
      category: 1234, // Not a string
      data: {},
    };

    expect(isValid(data1)).to.deep.equal({
      valid: false,
      errors: ['Field "category" failed to typecheck (expected string)'],
    });

    const data2 = {
      category: 'edition',
      data: 'not an object',
    };

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: ['Field "data" failed to typecheck (expected object)'],
    });
  });

  it('should return true regardless of whether optional fields are present', () => {
    const data1 = {
      category: 'edition',
      data: {},
    };

    expect(isValid(data1)).to.deep.equal({
      valid: true,
      errors: [],
    });

    const data2 = {
      category: 'edition',
      data: {},
      children: [],
    };

    expect(isValid(data2)).to.deep.equal({
      valid: true,
      errors: [],
    });
  });

  it('should return false when optional fields have the wrong types', () => {
    const data1 = {
      category: 'edition',
      data: {},
      children: {}, // Not an array
    };

    expect(isValid(data1)).to.deep.equal({
      valid: false,
      errors: ['Field "children" failed to typecheck (expected array)'],
    });

    const data2 = {
      category: 'edition',
      data: {},
      children: 456, // Not an array
    };

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: ['Field "children" failed to typecheck (expected array)'],
    });
  });
});

describe('#arrayValidator()', () => {
  const testSchema = {
    type: 'string',
    predicates: [
      {
        test: s => s.length >= 10,
        onError: s => `Item "${s}" was less than 10`,
      },
      {
        test: s => !s.includes('xyz'),
        onError: s => `Item "${s}" contained xyz`,
      },
    ],
  };

  const isValid = arrayValidator(testSchema);

  it('should return errors if the passed data is not an array', () => {
    const data1 = 12345;

    expect(isValid(data1)).to.deep.equal({
      valid: false,
      errors: ['Data was not an array'],
    });

    const data2 = 'not an array';

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: ['Data was not an array'],
    });

    const data3 = {
      not: 'an array',
    };

    expect(isValid(data3)).to.deep.equal({
      valid: false,
      errors: ['Data was not an array'],
    });
  });

  it('should return errors if the array items are not of the given type', () => {
    const data1 = [12345];

    expect(isValid(data1)).to.deep.equal({
      valid: false,
      errors: ['Item "12345" failed to typecheck (expected string)'],
    });

    const data2 = [['array'], ['of'], ['strings']];

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: [
        'Item "array" failed to typecheck (expected string)',
        'Item "of" failed to typecheck (expected string)',
        'Item "strings" failed to typecheck (expected string)',
      ],
    });
  });

  it('should return errors if any array item fails any of the given predicates', () => {
    const data1 = ['too small', 'long enough'];

    expect(isValid(data1)).to.deep.equal({
      valid: false,
      errors: ['Item "too small" was less than 10'],
    });

    const data2 = ['I contain xyz'];

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: ['Item "I contain xyz" contained xyz'],
    });

    const data3 = ['xyzxyz'];

    expect(isValid(data3)).to.deep.equal({
      valid: false,
      errors: ['Item "xyzxyz" was less than 10', 'Item "xyzxyz" contained xyz'],
    });
  });
});

describe('nesting', () => {
  it('should handle object validation inside arrays', () => {
    const objectSchema = {
      name: {
        type: 'string',
        required: true,
      },
      age: {
        type: 'number',
        required: false,
      },
    };

    const arraySchema = {
      type: 'object',
      schemaValidator: objectValidator(objectSchema),
    };

    const isValid = arrayValidator(arraySchema);

    const data1 = [
      {
        name: 'Elliot',
      },
      {
        name: 'Tom',
        age: 25,
      },
    ];

    expect(isValid(data1)).to.deep.equal({
      valid: true,
      errors: [],
    });

    const data2 = [
      {
        age: 20,
      },
    ];

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: ['At item 0: Missing required field "name"'],
    });
  });

  it('should handle array validation inside objects', () => {
    const arraySchema = {
      type: 'string',
      predicates: [
        {
          test: s => s.charAt(0) === 'B',
          onError: s => `Item "${s}" didn't start with B`,
        },
      ],
    };

    const objectSchema = {
      name: {
        type: 'string',
        required: true,
      },
      children: {
        type: 'array',
        required: false,
        schemaValidator: arrayValidator(arraySchema),
      },
    };

    const isValid = objectValidator(objectSchema);

    const data1 = {
      name: 'Bob',
      children: ['Betty', 'Beatrice'],
    };

    expect(isValid(data1)).to.deep.equal({
      valid: true,
      errors: [],
    });

    const data2 = {
      name: 'Mary',
      children: ['Mark'],
    };

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: [`At field "children": Item "Mark" didn't start with B`],
    });
  });

  it('should handle object validation inside objects', () => {
    const childSchema = {
      age: {
        type: 'number',
        required: true,
      },
    };

    const parentSchema = {
      name: {
        type: 'string',
        required: true,
      },
      child: {
        type: 'object',
        required: true,
        schemaValidator: objectValidator(childSchema),
      },
    };

    const isValid = objectValidator(parentSchema);

    const data1 = {
      name: 'Hugo',
      child: {
        age: 12,
      },
    };

    expect(isValid(data1)).to.deep.equal({
      valid: true,
      errors: [],
    });

    const data2 = {
      name: 'Hector',
      child: {
        age: 'not a number',
      },
    };

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: [
        'At field "child": Field "age" failed to typecheck (expected number)',
      ],
    });
  });

  it('should handle array validation inside arrays', () => {
    const childSchema = {
      type: 'string',
      predicates: [
        {
          test: x => x.length <= 10,
          onError: x => `Item "${x}" was longer than 10 characters`,
        },
      ],
    };

    const parentSchema = {
      type: 'array',
      schemaValidator: arrayValidator(childSchema),
    };

    const isValid = arrayValidator(parentSchema);

    const data1 = [['small', 'tiny'], ['petite']];

    expect(isValid(data1)).to.deep.equal({
      valid: true,
      errors: [],
    });

    const data2 = [['much too lengthy'], ['so is this one']];

    expect(isValid(data2)).to.deep.equal({
      valid: false,
      errors: [
        'At item 0: Item "much too lengthy" was longer than 10 characters',
        'At item 1: Item "so is this one" was longer than 10 characters',
      ],
    });
  });
});

describe('typechecking', () => {
  const dateSchema = {
    publishedDate: {
      type: 'date',
      required: true,
    },
  };

  const isValid = objectValidator(dateSchema);

  it('should allow either Date objects or ISO strings to validate as dates', () => {
    const data1 = {
      publishedDate: new Date(),
    };

    const data2 = {
      publishedDate: new Date().toJSON(),
    };

    const data3 = {
      publishedDate: new Date().toISOString(),
    };

    const data4 = {
      publishedDate: '2017-04-06G17:16:20.762Z', // 'G' is invalid (should be 'T')
    };

    const data5 = {
      publishedDate: 12345,
    };

    expect(isValid(data1)).to.deep.equal({
      valid: true,
      errors: [],
    });

    expect(isValid(data2)).to.deep.equal({
      valid: true,
      errors: [],
    });

    expect(isValid(data3)).to.deep.equal({
      valid: true,
      errors: [],
    });

    expect(isValid(data4)).to.deep.equal({
      valid: false,
      errors: ['Field "publishedDate" failed to typecheck (expected date)'],
    });

    expect(isValid(data5)).to.deep.equal({
      valid: false,
      errors: ['Field "publishedDate" failed to typecheck (expected date)'],
    });
  });
});
