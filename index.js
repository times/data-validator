const { compose, objectValidator, arrayValidator } = require('./lib/compose');
const { toResult, ok, err, isOK, isErr } = require('./lib/result');

module.exports = {
  compose,
  objectValidator,
  arrayValidator,
  toResult,
  ok,
  err,
  isOK,
  isErr,
};
