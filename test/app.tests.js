'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-generator').assert;
//var _ = require('lodash');

var allFiles = [
    '.jshintrc',
    '.jscsrc',
    '.tern-project',
    '.jsbeautifyrc',
    '.gitignore'
];

var projectFiles = function(done, expectedFiles) {
    // always tranform the argument into an array
    expectedFiles = [].concat(expectedFiles);

    // deducte the options to pass to the generator from the file name
    var options = expectedFiles.map(function(file) {
        return file
            .replace('.', '')
            .replace('-', '');
    });

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
            if(err) {
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
});