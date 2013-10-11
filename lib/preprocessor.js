var istanbul = require('istanbul');

var createCoveragePreprocessor = function(logger, basePath, reporters) {
  var log = logger.create('preprocessor.coverage');
  var instrumenter = new istanbul.Instrumenter();

  // if coverage reporter is not used, do not preprocess the files
  if (reporters.indexOf('coverage') === -1) {
    return function(content, _, done) {
      done(content);
    };
  }
  return function(content, file, done) {
    log.debug('Processing "%s".', file.originalPath);
    var jsPath = file.originalPath.replace(basePath + '/', './');
    var jsPathTemp = jsPath + '-temporaty-js-file.js'; ////// ICI
    fs.writeFile(jsPathTemp, content, function(err) {
      if (err) throw '##########' + err;
      instrumenter.instrument(content, jsPathTemp, function(err, instrumentedCode) {
        if(err) {
          log.error('%s\n  at %s', err.message, file.originalPath);
        }
        //fs.unlinkSync(jsPathTemp);
        done(instrumentedCode);
      });
    });
  };
};

createCoveragePreprocessor.$inject = ['logger', 'config.basePath', 'config.reporters'];

module.exports = createCoveragePreprocessor;
