'use strict';

var path = require('path');
var helpers = require('yeoman-generator').test;
var testHelper = require('./testHelper')();
var mockery = require('mockery');
var os = require('os');
var _ = require('lodash');

var generator = '../gulps';

describe('sublime:gulps', function() {

    var allTasks = [
        'lint',
        'serve',
        'browserify',
        'release',
        'karma',
        'changelog',
        'test'
    ];

    before(function() {
        testHelper.startMock(mockery);
        mockery.registerMock('child_process', testHelper.childProcessMock);
    });

    beforeEach(function(done) {

        var defaultOptions = {};

        this.runGen = helpers.run(path.join(__dirname, generator))
            .inDir(path.join(os.tmpdir(), testHelper.tempFolder))
            .withOptions(defaultOptions);
        done();

    });

    after(function() {
        testHelper.endMock(mockery);
    });

    var projectFiles = function(done, expectedTasks, assertNoFile) {
        assertNoFile = assertNoFile !== false;
        // always tranform the argument into an array
        expectedTasks = expectedTasks ? [].concat(expectedTasks) : [];

        this.runGen.withPrompt({
            'Tasks': expectedTasks
        }).on('end', function() {

            if(expectedTasks.length > 0) {
                assert.file('gulpfile.js');
                assert.file('gulp/common/constants.js');
            } else {

                assert.noFile('gulp/common/constants.js');
            }

            function taskToFile(task) {
                return 'gulp/tasks/' + task + '.js';
            }
            assert.file(_.map(expectedTasks, taskToFile));
            var noFiles = allTasks.filter(function(task) {
                return expectedTasks.indexOf(task) === -1;
            }).map(taskToFile);
            if(assertNoFile) {
                assert.noFile(noFiles);
            }
            done();
        });
    };

    it('with no option should not scaffold any file', function(done) {
        projectFiles.call(this, done, null);
    });

    it('with option lint should scaffold lint.js', function(done) {
        projectFiles.call(this, done, ['lint']);
    });

    it('with option serve should scaffold serve.js', function(done) {
        projectFiles.call(this, done, ['serve']);
    });

    it('with option browserify should scaffold browserify.js', function(done) {
        projectFiles.call(this, done, ['browserify']);
    });

    it('with option release should scaffold release.js', function(done) {
        projectFiles.call(this, done, ['release']);
    });

    it('with option karma should scaffold karma.js', function(done) {
        projectFiles.call(this, done, ['karma']);
    });

    it('with option changelog should scaffold changelog.js', function(done) {
        projectFiles.call(this, done, ['changelog']);
    });

    it('with option test should scaffold test.js and lint.js', function(done) {
        projectFiles.call(this, function() {
            assert.file('gulp/tasks/lint.js');
            done();
        }, ['test'], false);

    });
});