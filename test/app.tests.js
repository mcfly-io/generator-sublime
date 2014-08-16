'use strict';
var path = require('path');
var fs = require('fs');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-generator').assert;
var stripJsonComments = require('strip-json-comments');
//var _ = require('lodash');

var allFiles = [
    '.jshintrc',
    '.jscsrc',
    '.tern-project',
    '.jsbeautifyrc',
    '.gitignore'
];

var createOptionsFromFiles = function(files) {
    var options = files.map(function(file) {
        return file
            .replace('.', '')
            .replace('-', '');
    });
    return options;
};

var readTextFile = function(filename) {
    var body = fs.readFileSync(filename, 'utf8');
    return body;
};

var readJsonFile = function(filename) {
    var body = readTextFile(filename);
    return JSON.parse(stripJsonComments(body));
};

var projectFiles = function(done, expectedFiles) {
    // always tranform the argument into an array
    expectedFiles = [].concat(expectedFiles);

    // deduce the options to pass to the generator from the file name
    var options = createOptionsFromFiles(expectedFiles);

    // pass the options to the generator
    helpers.mockPrompt(this.app, {
        'files': options
    });

    // run the generator and check the resulting files
    this.app.run({}, function() {
        helpers.assertFile(expectedFiles);
        var noFiles = allFiles.filter(function(file) {
            return expectedFiles.indexOf(file) == -1;
        });

        assert.noFile(noFiles);
        done();
    });
};

describe('sublime generator', function() {

    beforeEach(function(done) {

        helpers.testDirectory(path.join(__dirname, 'temp'), function(err) {
            if (err) {
                return done(err);
            }

            this.app = helpers.createGenerator('sublime:app', [
                '../../app'
            ]);
            done();
        }.bind(this));
    });

    it('projectFiles when no option should not create any files', function(done) {
        projectFiles.call(this, done, []);
    });

    it('projectFiles with jshint should only create .jshintrc file', function(done) {
        projectFiles.call(this, done, ['.jshintrc']);
    });

    it('projectFiles with jscsrc should only create .jscsrc file', function(done) {
        projectFiles.call(this, done, ['.jscsrc']);
    });

    it('projectFiles with tern_project should only create .tern-project file', function(done) {
        projectFiles.call(this, done, ['.tern-project']);
    });

    it('projectFiles with gitignore should only create .gitignore file', function(done) {
        projectFiles.call(this, done, ['.gitignore']);
    });

    it('projectFiles with all options should create all files', function(done) {
        projectFiles.call(this, done, allFiles);
    });

    it('projectFiles with indent value should succeed', function(done) {

        var indent = 12;
        var options = createOptionsFromFiles(allFiles);

        // pass the options to the generator
        helpers.mockPrompt(this.app, {
            'files': options,
            'indent': indent
        });

        // run the generator and check the resulting files
        this.app.run({}, function() {
            var jshintrc = readJsonFile('.jshintrc');
            var jscsrc = readJsonFile('.jscsrc');
            var jsbeautifyrc = readJsonFile('.jsbeautifyrc');

            assert.equal(jshintrc.indent, indent);
            assert.equal(jscsrc.validateIndentation, indent);
            assert.equal(jsbeautifyrc.html.indent_size, indent);
            assert.equal(jsbeautifyrc.css.indent_size, indent);
            assert.equal(jsbeautifyrc.js.indent_size, indent);

            done();
        });
    });

});
