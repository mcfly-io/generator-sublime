'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
//var mockery = require('mockery');
var testHelper = require('./testHelper')();
var _ = require('lodash');
var os = require('os');
require('./helpers/globals');
var generator = '../app';

var allFiles = [
    '.jshintrc',
    '.jscsrc',
    '.eslintrc',
    '.tern-project',
    '.jsbeautifyrc',
    '.gitignore',
    '.travis.yml',
    '.codeclimate.yml',
    'shippable.yml',
    'readme.md',
    '.settings',
    '.codio'
];

var createOptionsFromFiles = function(_, files) {
    var options = files.map(function(file) {
        return _.capitalize(_.camelCase(file));
    });
    return options;
};

var projectFiles = function(done, expectedFiles, prompts) {

    // always tranform the argument into an array
    expectedFiles = expectedFiles ? [].concat(expectedFiles) : [];

    // deduce the options to pass to the generator from the file name
    var options = createOptionsFromFiles(_, expectedFiles);

    prompts = prompts || {};
    _.extend(prompts, {
        'Files': options,
        githubUser: testHelper.githubUserMock.user
    });

    this.runGen.withPrompts(prompts)
        .on('end', function() {
            assert.file(expectedFiles);
            var noFiles = allFiles.filter(function(file) {
                return expectedFiles.indexOf(file) === -1;
            });

            assert.noFile(noFiles);
            done();
        });
};

describe('sublime:app', function() {

    var defaultOptions;

    before(function() {
        //testHelper.startMock(mockery);
        //mockery.registerMock('github', testHelper.githubMock);
        //mockery.registerMock('child_process', testHelper.childProcessMock);
        //mockery.registerMock('npm', testHelper.npmMock);
        //mockery.registerMock('update-notifier', testHelper.updateNotifierMock.bind(this, false));
    });

    beforeEach(function(done) {

        defaultOptions = {
            'skip-welcome-message': true,
            checkTravis: false
        };

        this.runGen = helpers.run(path.join(__dirname, generator))
            .inDir(path.join(os.tmpdir(), testHelper.tempFolder))
            .withOptions(defaultOptions);

        done();

    });

    after(function() {
        //testHelper.endMock(mockery);
    });

    it('with option skip-welcome-message false should display welcome message', function(done) {
        var yosay = sinon.spy();
        //mockery.registerMock('yosay', yosay);
        this.runGen.withOptions({
                'skip-welcome-message': false
            })
            .on('ready', function(generator) {
                generator.utils.yosay = yosay;
            })
            .on('end', function() {
                assert(yosay.calledWith('Welcome to the marvelous Sublime generator!'), 'yosay was not called with welcome message');
                done();
            });
    });

    it('with option skip-welcome-message true should not display welcome message', function(done) {
        var yosay = sinon.spy();
        //mockery.registerMock('yosay', yosay);
        this.runGen.withOptions({
                'skip-welcome-message': true
            })
            .on('ready', function(generator) {
                generator.utils.yosay = yosay;
            })
            .on('end', function() {
                assert(yosay.callCount === 0, 'yosay should not be called');
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

    it('with Files anwser Eslintrc should only create .eslintrc file', function(done) {
        projectFiles.call(this, done, ['.eslintrc', '.eslintignore']);
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

    it('with Files anwser TravisYml should only create .travis.yml and .codeclimate.yml file', function(done) {
        projectFiles.call(this, done, ['.travis.yml', '.codeclimate.yml']);
    });

    xit('.travis.yml with NpmPublish false does not contains github info', function(done) {

        projectFiles.call(this, function() {
            var body = testHelper.readTextFile('.travis.yml');
            assert.equal(body.indexOf('provider: npm') < 0, true);
            assert.equal(body.indexOf('email: ' + testHelper.githubUserMock.email) > 0, true);
            assert.equal(body.indexOf('repo: ' + testHelper.githubUserMock.user + '/temp') < 0, true);
            done();
        }, ['.travis.yml', '.codeclimate.yml'], {
            NpmPublish: false
        });
    });

    xit('.travis.yml with NpmPublish true does contains github info', function(done) {

        projectFiles.call(this, function() {
            var body = testHelper.readTextFile('.travis.yml');

            assert.equal(body.indexOf('provider: npm') > 0, true);
            assert.equal(body.indexOf('email: ' + testHelper.githubUserMock.email) > 0, true);
            assert.equal(body.indexOf('repo: ' + testHelper.githubUserMock.user + '/temp') > 0, true);
            done();
        }, ['.travis.yml', '.codeclimate.yml'], {
            NpmPublish: true
        });
    });

    it('.travis.yml should have short node version', function(done) {
        projectFiles.call(this, function() {
            var body = testHelper.readTextFile('.travis.yml');
            assert.equal(body.indexOf('- 0.12\n') > 0, true);
            done();
        }, ['.travis.yml', '.codeclimate.yml']);
    });

    it('with Files anwser ReadmeMd should only create readme.md file', function(done) {
        projectFiles.call(this, done, ['readme.md']);
    });

    it('with Files anwser Settings should only create .settings and .codio file', function(done) {
        projectFiles.call(this, done, ['.settings', '.codio']);
    });

    it('with Files anwser with all options should create all files', function(done) {
        projectFiles.call(this, done, allFiles);
    });

    it('with Indent answer should set correct indentation in .jshintrc, .jscsrc and .jsbeautify', function(done) {

        var indent = 12;
        var options = createOptionsFromFiles(_, allFiles);
        this.runGen.withPrompts({
                'Files': options,
                'Indent': indent
            })
            .on('ready', function(generator) {
                generator.email = '';
            })
            .on('end', function() {
                var jshintrc = testHelper.readJsonFile('.jshintrc');
                var jscsrc = testHelper.readJsonFile('.jscsrc');
                var eslintrc = testHelper.readJsonFile('.eslintrc');
                var jsbeautifyrc = testHelper.readJsonFile('.jsbeautifyrc');
                var settings = testHelper.readTextFile('.settings');
                assert.equal(jshintrc.indent, indent);
                assert.equal(eslintrc.rules.indent[1], indent);
                assert.equal(eslintrc.rules['nodeca/indent'][2], indent);
                assert.equal(jscsrc.validateIndentation, indent);
                assert.equal(jsbeautifyrc.html.indent_size, indent);
                assert.equal(jsbeautifyrc.css.indent_size, indent);
                assert.equal(jsbeautifyrc.js.indent_size, indent);
                assert(_.contains(settings, 'tab_size = ' + indent));
                done();
            });

    });

    it('with CodioStartup answser true should create startup.sh file', function(done) {
        this.runGen.withPrompts({
            'CodioStartup': true
        }).on('end', function() {
            assert.file('startup.sh');
            done();
        });

    });

    it('with CodioStartup answser true should include correct version for node in startup.sh', function(done) {

        var nodeVersion = 'xxx';
        this.runGen
            .withOptions({
                nodeVersion: nodeVersion
            })
            .withPrompts({
                'CodioStartup': true
            }).on('end', function() {

                var body = testHelper.readTextFile('startup.sh');
                assert.equal(body.indexOf('NODE_VERSION="' + nodeVersion + '"') > 0, true, 'Invalid version of node');
                done();
            });

    });

    it('with CodioStartup answser false should not create startup.sh file', function(done) {

        this.runGen.withPrompts({
            'CodioStartup': false
        }).on('end', function() {
            assert.noFile('startup.sh');
            done();
        });

    });

    it('with Gitconfig answser true should create git-config.sh and validate-commit-msg.js file', function(done) {

        this.runGen.withPrompts({
            'Gitconfig': true
        }).on('end', function() {
            assert.file('bin/git-config.sh');
            assert.file('bin/validate-commit-msg.js');
            done();
        });
    });

    it('with Gitconfig answser false should not create git-config.sh and validate-commit-msg.js file', function(done) {

        this.runGen.withPrompts({
            'Gitconfig': false
        }).on('end', function() {
            assert.noFile('bin/git-config.sh');
            assert.noFile('bin/validate-commit-msg.js');
            done();
        });
    });

    it('with CodioStartup and Gitconfig answser true should reference git-config.sh from startup.sh', function(done) {

        this.runGen.withPrompts({
            'CodioStartup': true,
            'Gitconfig': true
        }).on('end', function() {
            var body = testHelper.readTextFile('startup.sh');
            assert.equal(body.indexOf('git-config.sh') > 0, true);
            done();
        });

    });

    it('with CodioStartup answser true and Gitconfig anwser false should not reference git-config.sh from startup.sh', function(done) {

        this.runGen.withPrompts({
            'CodioStartup': true,
            'Gitconfig': false
        }).on('end', function() {
            var body = testHelper.readTextFile('startup.sh');
            assert.equal(body.indexOf('git-config.sh') < 0, true);
            done();
        });
    });

});
