var istanbul = require('istanbul')
  , fs = require('fs')
  , path = require('path');

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
    var jsPath = file.originalPath.replace(basePath + '/', basePath + '/.compiled-js/');
    mkpath.sync(path.dirname(jsPath));
    fs.writeFile(jsPath, content, function(err) {
      if (err) throw err;
      instrumenter.instrument(content, jsPath, function(err, instrumentedCode) {
        if(err) {
          log.error('%s\n  at %s', err.message, file.originalPath);
        }
        done(instrumentedCode);
      });
    });
  };

};

createCoveragePreprocessor.$inject = ['logger', 'config.basePath', 'config.reporters'];

module.exports = createCoveragePreprocessor;








var mkpath = function mkpath(dirpath, mode, callback) {
    dirpath = path.resolve(dirpath);

    if (typeof mode === 'function' || typeof mode === 'undefined') {
        callback = mode;
        mode = 0777 & (~process.umask());
    }

    if (!callback) {
        callback = function () {};
    }

    fs.stat(dirpath, function (err, stats) {
        if (err) {
            if (err.code === 'ENOENT') {
                mkpath(path.dirname(dirpath), mode, function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        fs.mkdir(dirpath, mode, callback);
                    }
                });
            } else {
                callback(err);
            }
        } else if (stats.isDirectory()) {
            callback(null);
        } else {
            callback(new Error(dirpath + ' exists and is not a directory'));
        }
    });
};

mkpath.sync = function mkpathsync(dirpath, mode) {
    dirpath = path.resolve(dirpath);

    if (typeof mode === 'undefined') {
        mode = 0777 & (~process.umask());
    }

    try {
        if (!fs.statSync(dirpath).isDirectory()) {
            throw new Error(dirpath + ' exists and is not a directory');
        }
    } catch (err) {
        if (err.code === 'ENOENT') {
            mkpathsync(path.dirname(dirpath), mode);
            fs.mkdirSync(dirpath, mode);
        } else {
            throw err;
        }
    }
};

