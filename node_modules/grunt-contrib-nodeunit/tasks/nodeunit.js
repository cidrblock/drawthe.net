/*
 * grunt-contrib-nodeunit
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Nodejs libs.
  var path = require('path');
  var util = require('util');
  var fs = require('fs');

  // External libs.
  var nodeunit = require('nodeunit');

  function hook_stdout(callback) {
    var oldWrite = process.stdout.write;

    process.stdout.write = (function() {
      return function(string, encoding, fd) {
        //write.apply(process.stdout, arguments)
        callback(string, encoding, fd);
      };
    })(process.stdout.write);

    return function() {
      process.stdout.write = oldWrite;
    };
  }

  // ==========================================================================
  // BETTER ERROR DISPLAY
  // ==========================================================================

  // Much nicer error formatting than what comes with nodeunit.
  var betterErrors = function (assertion) {
    var e = assertion.error;
    if (!e || !('actual' in e) || !('expected' in e)) {
      return assertion;
    }

    // Temporarily override the global "inspect" property because logging
    // the entire global object is just silly.
    var globalInspect = global.inspect;
    global.inspect = function() {
      return '[object global]';
    };

    e._message = e.message;

    // Pretty-formatted objects.
    var actual = util.inspect(e.actual, { depth: 10, colors: true });
    var expected = util.inspect(e.expected, { depth: 10, colors: true });

    var indent = function(str) {
      return ('' + str).split('\n').map(function(s) { return '  ' + s; }).join('\n');
    };

    var stack;
    var multiline = (actual + expected).indexOf('\n') !== -1;
    if (multiline) {
      stack = [
        'Actual:', indent(actual),
        'Operator:', indent(e.operator),
        'Expected:', indent(expected)
      ].join('\n');
    } else {
      stack = e.name + ': ' + actual + ' ' + e.operator + ' ' + expected;
    }

    if (e.stack) {
      stack += '\n' + e.stack.split('\n').slice(1).join('\n');
    }

    e.stack = stack;

    // Restore the global "inspect" property.
    global.inspect = globalInspect;
    return assertion;
  };

  // Reformat stack trace to remove nodeunit scripts, fix indentation, etc.
  var cleanStack = function(error) {
    error._stack = error.stack;
    // Show a full stack trace?
    var fullStack = grunt.option('verbose') || grunt.option('stack');
    // Reformat stack trace output.
    error.stack = error.stack.split('\n').map(function(line) {
      if (line[0] === ' ') {
        // Remove nodeunit script srcs from non-verbose stack trace.
        if (!fullStack && line.indexOf(path.join('node_modules', 'nodeunit') + path.sep) !== -1) {
          return '';
        }
        // Remove leading spaces.
        line = line.replace(/^ {4}(?=at)/, '');
        // Remove cwd.
        line = line.replace('(' + process.cwd() + path.sep, '(');
      } else {
        line = line.replace(/Assertion(Error)/, '$1');
      }
      return line + '\n';
    }).join('');

    return error;
  };

  // ==========================================================================
  // CUSTOM NODEUNIT REPORTER
  // ==========================================================================

  // Keep track of the last-started module.
  var currentModule;
  // Keep track of the last-started test(s).
  var unfinished = {};

  // If Nodeunit explodes because a test was missing test.done(), handle it.
  process.on('exit', function() {
    var len = Object.keys(unfinished).length;
    // If there are unfinished tests, tell the user why Nodeunit killed grunt.
    if (len > 0) {
      grunt.log.muted = false;
      grunt.verbose.error().or.writeln('F'.red);
      grunt.log.error('Incomplete tests/setups/teardowns:');
      Object.keys(unfinished).forEach(grunt.log.error, grunt.log);
      grunt.fatal('A test was missing test.done(), so nodeunit exploded. Sorry!',
        Math.min(99, 90 + len));
    }
  });

  // Keep track of failed assertions for pretty-printing.
  var failedAssertions = [];
  function logFailedAssertions() {
    var assertion;
    // Print each assertion error + stack.
    while (assertion = failedAssertions.shift()) {
      betterErrors(assertion);
      cleanStack(assertion.error);
      grunt.verbose.or.error(assertion.testName);
      if (assertion.error.name === 'AssertionError' && assertion.message) {
        grunt.log.error('Message: ' + assertion.message.magenta);
      }
      grunt.log.error(assertion.error.stack).writeln();
    }
  }

  // Define our own Nodeunit reporter.
  nodeunit.reporters.grunt = {
    info: 'Grunt reporter',
    run: function(files, options, callback) {
      var opts = {
        // No idea.
        testspec: undefined,
        // Executed when the first test in a file is run. If no tests exist in
        // the file, this doesn't execute.
        moduleStart: function(name) {
          // Keep track of this so that moduleDone output can be suppressed in
          // cases where a test file contains no tests.
          currentModule = name;
          grunt.verbose.subhead('Testing ' + name).or.write('Testing ' + name);
        },
        // Executed after a file is done being processed. This executes whether
        // tests exist in the file or not.
        moduleDone: function(name) {
          // Abort if no tests actually ran.
          if (name !== currentModule) {
            return;
          }
          // Print assertion errors here, if verbose mode is disabled.
          if (!grunt.option('verbose')) {
            if (failedAssertions.length > 0) {
              grunt.log.writeln();
              logFailedAssertions();
            } else {
              grunt.log.ok();
            }
          }
        },
        // Executed before each test is run.
        testStart: function(name) {
          // Keep track of the current test, in case test.done() was omitted
          // and Nodeunit explodes.
          unfinished[name] = name;
          grunt.verbose.write(name + '...');
          // Mute output, in cases where a function being tested logs through
          // grunt (for testing grunt internals).
          grunt.log.muted = true;
        },
        // Executed after each test and all its assertions are run.
        testDone: function(name, assertions) {
          delete unfinished[name];
          // Un-mute output.
          grunt.log.muted = false;
          // Log errors if necessary, otherwise success.
          if (assertions.failures()) {
            assertions.forEach(function(ass) {
              if (ass.failed()) {
                ass.testName = name;
                failedAssertions.push(ass);
              }
            });
            if (grunt.option('verbose')) {
              grunt.log.error();
              logFailedAssertions();
            } else {
              grunt.log.write('F'.red);
            }
          } else {
            grunt.verbose.ok().or.write('.');
          }
        },
        // Executed when everything is all done.
        done: function (assertions) {
          if (assertions.failures()) {
            grunt.warn(assertions.failures() + '/' + assertions.length +
              ' assertions failed (' + assertions.duration + 'ms)');
          } else if (assertions.length === 0) {
            grunt.warn('0/0 assertions ran (' + assertions.duration + 'ms)');
          } else {
            grunt.verbose.writeln();
            grunt.log.ok(assertions.length + ' assertions passed (' +
              assertions.duration + 'ms)');
          }
          // Tell the task manager we're all done.
          callback(); // callback(assertions.failures() === 0);
        }
      };

      // Nodeunit needs absolute paths.
      var paths = files.map(function(filepath) {
        return path.resolve(filepath);
      });
      nodeunit.runFiles(paths, opts);
    }
  };

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('nodeunit', 'Run Nodeunit unit tests.', function() {
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      reporterOutput: false,
      reporter: 'grunt',
      reporterOptions: {}
    });

    // Ensure the default nodeunit options are set by reading in the nodeunit.json file.
    var nodeUnitDefaults = {};

    // check for nodeunit under our package's node_modules directory first
    var nodeUnitDefaultsFile = path.join(__dirname, '..', 'node_modules', 'nodeunit', 'bin', 'nodeunit.json');

    if (!fs.existsSync(nodeUnitDefaultsFile)) {
      // if both grunt-contrib-nodeunit and nodeunit are listed as dependencies for this project, they'd
      // be located at the same folder level.  So check for that location next.
      nodeUnitDefaultsFile = path.join(__dirname, '..', '..', 'nodeunit', 'bin', 'nodeunit.json');
    }

    if (fs.existsSync(nodeUnitDefaultsFile)) {
      nodeUnitDefaults = JSON.parse(fs.readFileSync(nodeUnitDefaultsFile, 'utf8'));
    }

    for (var defaultVal in nodeUnitDefaults) {
      if (typeof options.reporterOptions[defaultVal] === 'undefined') {
        options.reporterOptions[defaultVal] = nodeUnitDefaults[defaultVal];
      }
    }

    if (!nodeunit.reporters[options.reporter]) {
      return done(new Error('Reporter ' + options.reporter + ' not found'));
    }

    var output = '';

    if (options.reporterOutput) {
      // Hook into stdout to capture report
      var unhook = hook_stdout(function(string) {
        output += string;
        return '';
      });
    }

    // if reporterOutput has a directory destination make sure to create it.
    // See: https://github.com/caolan/nodeunit/issues/262
    if (options.reporterOptions.output) {
      grunt.file.mkdir(path.normalize(options.reporterOptions.output));
    }

    // Run test(s).
    nodeunit.reporters[options.reporter].run(this.filesSrc, options.reporterOptions, function(err) {
      // Write the output of the reporter if wanted
      if (options.reporterOutput) {
        // no longer hook stdout so we can grunt.log
        if (unhook) {
          unhook();
        }

        // save all of the output we saw up to this point
        grunt.file.write(options.reporterOutput, output);

        grunt.log.ok('Report "' + options.reporterOutput + '" created.');
      }

      done(err);
    });
  });

};
