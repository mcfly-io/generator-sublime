'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-generator').assert;
var testHelper = require('./testHelper')();
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
            var jshintrc = testHelper.readJsonFile('.jshintrc');
            var jscsrc = testHelper.readJsonFile('.jscsrc');
            var jsbeautifyrc = testHelper.readJsonFile('.jsbeautifyrc');

            assert.equal(jshintrc.indent, indent);
            assert.equal(jscsrc.validateIndentation, indent);
            assert.equal(jsbeautifyrc.html.indent_size, indent);
            assert.equal(jsbeautifyrc.css.indent_size, indent);
            assert.equal(jsbeautifyrc.js.indent_size, indent);

            done();
        });
    });

    it('projectFiles with codio_startup should create startup.sh file', function(done) {
        helpers.mockPrompt(this.app, {
            'codio_startup': true
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            helpers.assertFile('startup.sh');
            done();
        });

    });

     it('projectFiles with no codio_startup should not create startup.sh file', function(done) {
        helpers.mockPrompt(this.app, {
            'codio_startup': false
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            assert.noFile('startup.sh');
            done();
        });

    });

    
    it('projectFiles with gitconfig should create git-config.sh file', function(done) {
        helpers.mockPrompt(this.app, {
            'gitconfig': true
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            helpers.assertFile('deploy/git-config.sh');
            done();
        });
    });

    it('projectFiles with no gitconfig should create git-config.sh file', function(done) {
        helpers.mockPrompt(this.app, {
            'gitconfig': false
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            assert.noFile('deploy/git-config.sh');
            done();
        });
    });
    
    it('projectFiles with codio_startup and gitconfig should reference git-config.sh from startup.sh', function(done) {
        helpers.mockPrompt(this.app, {
            'codio_startup': true,
            'gitconfig': true,
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            var body = testHelper.readTextFile('startup.sh');
            assert.equal(body.indexOf('git-config.sh') > 0, true);
            done();
        });

    });
    
    it('projectFiles with codio_startup and no gitconfig should not reference git-config.sh from startup.sh', function(done) {
        helpers.mockPrompt(this.app, {
            'codio_startup': true,
            'gitconfig': false,
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            var body = testHelper.readTextFile('startup.sh');
            console.log(body);
            assert.equal(body.indexOf('git-config.sh') < 0, true);
            done();
        });

    });
});