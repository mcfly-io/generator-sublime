'use strict';

var path = require('path');
var helpers = require('yeoman-generator').test;
var testHelper = require('./testHelper')();
var mockery = require('mockery');
var os = require('os');
var _ = require('lodash');

var generator = '../gulps';
describe('sublime:gulps', function() {
    describe('project files', function() {

        var allTasks = [
            'lint',
            'serve',
            'browserify',
            'release',
            'changelog',
            'test',
            'style'
        ];

        before(function() {
            testHelper.startMock(mockery);
            mockery.registerMock('child_process', testHelper.childProcessMock);
        });

        beforeEach(function(done) {

            var defaultOptions = {
                'skip-install': true
            };

            this.runGen = helpers.run(path.join(__dirname, generator))
                .inDir(path.join(os.tmpdir(), testHelper.tempFolder))
                .withOptions(defaultOptions)
                .on('ready', function(generator) {
                    helpers.stub(generator, 'npmInstall', function(packages, options, cb) {
                        cb();
                    });

                });
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

        it('with option changelog should scaffold changelog.js', function(done) {
            projectFiles.call(this, done, ['changelog']);
        });

        it('with option test should scaffold test.js and lint.js', function(done) {
            projectFiles.call(this, function() {
                assert.file('gulp/tasks/lint.js');
                done();
            }, ['test'], false);

        });
        it('with option style should scaffold style.js', function(done) {
            projectFiles.call(this, done, ['style']);
        });
    });

    describe('constants.js', function() {
        beforeEach(function(done) {

            this.runGen = helpers.run(path.join(__dirname, generator))
                .inDir(path.join(os.tmpdir(), testHelper.tempFolder))

            .on('ready', function(generator) {
                helpers.stub(generator, 'npmInstall', function(packages, options, cb) {
                    cb();
                });

            });
            done();

        });

        it('should include proper css when ionic framework', function(done) {
            this.runGen.withOptions({
                'skip-install': true,
                'ionic': true,
                'famous': false
            })
                .withPrompts({
                    Tasks: ['style']
                })
                .on('end', function() {
                    assert.file('gulp/common/constants.js');
                    var constantPath = path.join(os.tmpdir(), testHelper.tempFolder, 'gulp/common/constants.js');

                    var constants = require(constantPath)();

                    assert.deepEqual(constants.style.css.src, ['']);
                    done();
                });
        });

        it('should include proper css when famous framework', function(done) {
            this.runGen.withOptions({
                'skip-install': true,
                'ionic': false,
                'famous': true
            })
                .withPrompts({
                    Tasks: ['style']
                })
                .on('end', function() {
                    assert.file('gulp/common/constants.js');
                    var constantPath = path.join(os.tmpdir(), testHelper.tempFolder, 'gulp/common/constants.js');

                    // make sure the file is not cached by node as we are requiring it
                    delete require.cache[require.resolve(constantPath)];

                    var constants = require(constantPath)();

                    assert.deepEqual(constants.style.css.src, ['./bower_component/famous/famous.css',
                        './bower_components/famous-angular/famous-angular.css'
                    ]);
                    done();
                });
        });

    });
});