'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-generator').assert;
var mockery = require('mockery');
var testHelper = require('./testHelper')();
var _ = require('lodash');

var allFiles = [
    '.jshintrc',
    '.jscsrc',
    '.tern-project',
    '.jsbeautifyrc',
    '.gitignore',
    '.travis.yml',
    'shippable.yml'
];

var createOptionsFromFiles = function(_, files) {
    var options = files.map(function(file) {
        return _.classify(file);
    });
    return options;
};

var projectFiles = function(done, expectedFiles, prompts) {
    // always tranform the argument into an array
    expectedFiles = expectedFiles ? [].concat(expectedFiles) : [];

    // deduce the options to pass to the generator from the file name
    var options = createOptionsFromFiles(this.app._, expectedFiles);

    prompts = prompts || {};
    _.extend(prompts, {
        'Files': options,
        githubUser: testHelper.githubUserMock.user
    });

    // pass the options to the generator
    helpers.mockPrompt(this.app, prompts);

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

    before(function() {
        testHelper.startMock(mockery);
        mockery.registerMock('github', testHelper.githubMock);
        mockery.registerMock('child_process', testHelper.childProcessMock);
        mockery.registerMock('npm', testHelper.npmMock);
    });

    beforeEach(function(done) {

        helpers.testDirectory(path.join(__dirname, 'temp'), function(err) {
            if(err) {
                return done(err);
            }
            var deps = ['../../app'];
            this.app = helpers.createGenerator('sublime:app', deps);
            this.app.options.hideWelcome = true;
            done();
        }.bind(this));
    });

    after(function() {
        testHelper.endMock(mockery);
    });

    it('with option hideWelcome false should display welcome message', function(done) {

        this.app.options.hideWelcome = false;
        helpers.mockPrompt(this.app, {

        });
        this.app.run({}, function() {
            // TODO : Assert that yosay was called
            done();
        });
    });

    it('with option hideWelcome true should not display welcome message', function(done) {
        this.app.options.hideWelcome = true;
        helpers.mockPrompt(this.app, {

        });
        this.app.run({}, function() {
            // TODO : Assert that yosay was not called
            done();
        });
    });

    it('with Files answers null should not create any files', function(done) {
        projectFiles.call(this, done, null);
    });

    it('with Files answer Jshint should only create .jshintrc file', function(done) {
        projectFiles.call(this, done, ['.jshintrc']);
    });

    it('with Files anwser Jscsrc should only create .jscsrc file', function(done) {
        projectFiles.call(this, done, ['.jscsrc']);
    });

    it('with Files anwser TernProject should only create .tern-project file', function(done) {
        projectFiles.call(this, done, ['.tern-project']);
    });

    it('with Files answer Gitignore should only create .gitignore file', function(done) {
        projectFiles.call(this, done, ['.gitignore']);
    });

    it('with Files answer ShippableYml should only create shippable.yml file', function(done) {
        projectFiles.call(this, done, ['shippable.yml']);
    });

    it('with Files anwser TravisYml should only create .travis.yml file', function(done) {
        projectFiles.call(this, done, ['.travis.yml']);
    });

    it('.travis.yml with NpmPublish false does not contains github info', function(done) {
        projectFiles.call(this, function() {
            var body = testHelper.readTextFile('.travis.yml');
            assert.equal(body.indexOf('provider: npm') < 0, true);
            assert.equal(body.indexOf('email: ' + testHelper.githubUserMock.email) < 0, true);
            assert.equal(body.indexOf('repo: ' + testHelper.githubUserMock.user + '/temp') < 0, true);
            done();
        }, ['.travis.yml']);
    });

    it('.travis.yml with NpmPublish true does contains github info', function(done) {
        helpers.mockPrompt(this.app, {
            'NpmPublish': true
        });
        projectFiles.call(this, function() {
            var body = testHelper.readTextFile('.travis.yml');

            assert.equal(body.indexOf('provider: npm') > 0, true);
            assert.equal(body.indexOf('repo: ' + testHelper.githubUserMock.user + '/temp') > 0, true);
            done();
        }, ['.travis.yml'], {
            NpmPublish: true
        });
    });

    it('with Files anwser with all options should create all files', function(done) {
        projectFiles.call(this, done, allFiles);
    });

    it('with Indent answer should set correct indentation in .jshintrc, .jscsrc and .jsbeautify', function(done) {

        var indent = 12;
        var options = createOptionsFromFiles(this.app._, allFiles);

        // pass the options to the generator
        helpers.mockPrompt(this.app, {
            'Files': options,
            'Indent': indent
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

    it('with CodioStartup answser true should create startup.sh file', function(done) {
        helpers.mockPrompt(this.app, {
            'CodioStartup': true
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            helpers.assertFile('startup.sh');
            done();
        });

    });

    it('with CodioStartup answser true should include correct version for node in startup.sh', function(done) {
        helpers.mockPrompt(this.app, {
            'CodioStartup': true
        });
        var nodeVersion = 'xxx';
        this.app.options.nodeVersion = nodeVersion;
        // run the generator and check the resulting files
        this.app.run({}, function() {
            var body = testHelper.readTextFile('startup.sh');
            assert.equal(body.indexOf('NODE_VERSION="' + nodeVersion + '"') > 0, true, 'Invalid version of node');
            done();
        });

    });

    it('with CodioStartup answser false should not create startup.sh file', function(done) {
        helpers.mockPrompt(this.app, {
            'CodioStartup': false
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            assert.noFile('startup.sh');
            done();
        });

    });

    it('with Gitconfig answser true should create git-config.sh file', function(done) {
        helpers.mockPrompt(this.app, {
            'Gitconfig': true
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            helpers.assertFile('deploy/git-config.sh');
            done();
        });
    });

    it('with Gitconfig answser false should not create git-config.sh file', function(done) {
        helpers.mockPrompt(this.app, {
            'Gitconfig': false
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            assert.noFile('deploy/git-config.sh');
            done();
        });
    });

    it('with CodioStartup and Gitconfig answser true should reference git-config.sh from startup.sh', function(done) {
        helpers.mockPrompt(this.app, {
            'CodioStartup': true,
            'Gitconfig': true,
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            var body = testHelper.readTextFile('startup.sh');
            assert.equal(body.indexOf('git-config.sh') > 0, true);
            done();
        });

    });

    it('with CodioStartup answser true and Gitconfig anwser false should not reference git-config.sh from startup.sh', function(done) {
        helpers.mockPrompt(this.app, {
            'CodioStartup': true,
            'Gitconfig': false,
        });
        // run the generator and check the resulting files
        this.app.run({}, function() {
            var body = testHelper.readTextFile('startup.sh');
            assert.equal(body.indexOf('git-config.sh') < 0, true);
            done();
        });

    });
});