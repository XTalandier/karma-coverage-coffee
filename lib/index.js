module.exports = {
  'preprocessor:coverage-coffee': ['factory', require('./preprocessor')],
  'reporter:coverage-coffee': ['type', require('./reporter')]
};
