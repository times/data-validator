// @flow

/**
 * Flatten an array of nested arrays by one level
 */
type Flatten<T> = (Array<Array<T>>) => Array<T>;
export const flatten: Flatten<*> = xs =>
  xs.reduce((acc, x) => [...acc, ...x], []);
