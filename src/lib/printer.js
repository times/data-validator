// @flow
import { mapObjIndexed as mapObj, map, flatten, concat, values } from 'ramda';

type AST = {|
  type: string,
  value: any,
  errors: Array<string>,
  items?: {
    [string]: AST
  }
|};

type Context = {
  parentType?: string,
  itemKey?: string
};

// Verbose
type PrintVerboseHelper = boolean => AST => Array<string>;
const printVerboseHelper: PrintVerboseHelper = isNested => ast => {
  const { items = {}, errors, type } = ast;

  const withPrefix = key => err => {
    const at = isNested ? 'at' : 'At';

    const prefix =
      type === 'array'
        ? `${at} item ${key}: `
        : type === 'object' ? `${at} field ${key}: ` : ``;

    return prefix + err;
  };

  const nestedErrors = mapObj((v, k) =>
    map(withPrefix(k))(printVerboseHelper(true)(v))
  )(items);

  return concat(errors)(flatten(values(nestedErrors)));
};

type PrintVerbose = AST => Array<string>;
export const printVerbose: PrintVerbose = printVerboseHelper(false);
