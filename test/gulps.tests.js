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
                'skip-install': true,
                'clientFolder': 'www'
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
                    assert.file('gulp_tasks/common/constants.js');
                } else {

                    assert.noFile('gulp_tasks/common/constants.js');
                }

                function taskToFile(task) {
                    return 'gulp_tasks/tasks/' + task + '.js';
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
                assert.file('gulp_tasks/tasks/lint.js');
                done();
            }, ['test'], false);

        });
        it('with option style should scaffold style.js', function(done) {
            projectFiles.call(this, done, ['style']);
        });

        var checkOption = function(ctx, option, done) {
            var opts = {
                'skip-install': true,
                'ionic': false,
                'famous': false
            };
            opts[option] = true;

            ctx.runGen.withOptions(opts)
                .on('end', function() {
                    assert.file('gulp_tasks/common/constants.js');
                    assert.file('gulp_tasks/tasks/' + option + '.js');

                    done();
                });
        };

        it('should success with option lint', function(done) {
            checkOption(this, 'lint', done);
        });

        it('should success with option serve', function(done) {
            checkOption(this, 'serve', done);
        });

        it('should success with option browserify', function(done) {
            checkOption(this, 'browserify', done);
        });

        it('should success with option release', function(done) {
            checkOption(this, 'release', done);
        });

        it('should success with option changelog', function(done) {
            checkOption(this, 'changelog', done);
        });

        it('should success with option test', function(done) {
            checkOption(this, 'test', done);
        });

        it('should success with option style', function(done) {
            checkOption(this, 'style', done);
        });
    });

    describe('constants.js', function() {
        beforeEach(function(done) {

            this.runGen = helpers.run(path.join(__dirname, generator))
                .inDir(path.join(os.tmpdir(), testHelper.tempFolder))
                .withOptions({
                    clientFolder: 'www'
                })
                .on('ready', function(generator) {
                    helpers.stub(generator, 'npmInstall', function(packages, options, cb) {
                        cb();
                    });

                });
            done();

        });

        it('should set clientFolder', function(done) {
            this.runGen.withOptions({
                'skip-install': true,
                'ionic': true,
                'famous': false
            })
                .withPrompts({
                    Tasks: ['style']
                })
                .on('end', function() {
                    assert.file('gulp_tasks/common/constants.js');
                    var constantPath = path.join(os.tmpdir(), testHelper.tempFolder, 'gulp_tasks/common/constants.js');
                    // make sure the file is not cached by node as we are requiring it
                    delete require.cache[require.resolve(constantPath)];
                    var constants = require(constantPath)();

                    assert.equal(constants.clientFolder, 'www');
                    done();
                });
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
                    assert.file('gulp_tasks/common/constants.js');
                    var constantPath = path.join(os.tmpdir(), testHelper.tempFolder, 'gulp_tasks/common/constants.js');

                    // make sure the file is not cached by node as we are requiring it
                    delete require.cache[require.resolve(constantPath)];

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
                    assert.file('gulp_tasks/common/constants.js');
                    var constantPath = path.join(os.tmpdir(), testHelper.tempFolder, 'gulp_tasks/common/constants.js');

                    // make sure the file is not cached by node as we are requiring it
                    delete require.cache[require.resolve(constantPath)];

                    var constants = require(constantPath)();

                    assert.deepEqual(constants.style.css.src, [ //'./bower_components/famous/famous.css',
                        './bower_components/famous-angular/dist/famous-angular.css'
                    ]);
                    done();
                });
        });

        it('should include proper css when bootstrap framework', function(done) {
            this.runGen.withOptions({
                'skip-install': true,
                'ionic': false,
                'bootstrap': true
            })
                .withPrompts({
                    Tasks: ['style']
                })
                .on('end', function() {
                    assert.file('gulp_tasks/common/constants.js');
                    var constantPath = path.join(os.tmpdir(), testHelper.tempFolder, 'gulp_tasks/common/constants.js');

                    // make sure the file is not cached by node as we are requiring it
                    delete require.cache[require.resolve(constantPath)];

                    var constants = require(constantPath)();

                    assert.deepEqual(constants.style.css.src, [ //'./bower_components/famous/famous.css',
                        './bower_components/bootstrap/dist/bootstrap.css',
                        './bower_components/bootstrap/dist/bootstrap-theme.css'
                    ]);
                    done();
                });
        });

        it('should include proper fonts when ionic framework', function(done) {
            this.runGen.withOptions({
                'skip-install': true,
                'ionic': true,
                'famous': false
            })
                .withPrompts({
                    Tasks: ['style']
                })
                .on('end', function() {
                    assert.file('gulp_tasks/common/constants.js');
                    var constantPath = path.join(os.tmpdir(), testHelper.tempFolder, 'gulp_tasks/common/constants.js');

                    // make sure the file is not cached by node as we are requiring it
                    delete require.cache[require.resolve(constantPath)];

                    var constants = require(constantPath)();

                    assert.deepEqual(constants.fonts.src, ['./bower_components/ionic/release/fonts/*.*']);
                    done();
                });
        });

        it('should include proper fonts when fontawesome framework', function(done) {
            this.runGen.withOptions({
                'skip-install': true,
                'ionic': false,
                'famous': false,
                'fontawesome': true
            })
                .withPrompts({
                    Tasks: ['style']
                })
                .on('end', function() {
                    assert.file('gulp_tasks/common/constants.js');
                    var constantPath = path.join(os.tmpdir(), testHelper.tempFolder, 'gulp_tasks/common/constants.js');

                    // make sure the file is not cached by node as we are requiring it
                    delete require.cache[require.resolve(constantPath)];

                    var constants = require(constantPath)();

                    assert.deepEqual(constants.fonts.src, ['./bower_components/font-awesome/fonts/*.*']);
                    done();
                });
        });

        it('should include proper fonts when bootstrap framework', function(done) {
            this.runGen.withOptions({
                'skip-install': true,
                'ionic': false,
                'famous': false,
                'bootstrap': true
            })
                .withPrompts({
                    Tasks: ['style']
                })
                .on('end', function() {
                    assert.file('gulp_tasks/common/constants.js');
                    var constantPath = path.join(os.tmpdir(), testHelper.tempFolder, 'gulp_tasks/common/constants.js');

                    // make sure the file is not cached by node as we are requiring it
                    delete require.cache[require.resolve(constantPath)];

                    var constants = require(constantPath)();

                    assert.deepEqual(constants.fonts.src, ['./bower_components/bootstrap/dist/fonts/*.*']);
                    done();
                });
        });

        it('should include proper empty fonts when no framework', function(done) {
            this.runGen.withOptions({
                'skip-install': true,
                'ionic': false,
                'famous': false
            })
                .withPrompts({
                    Tasks: ['style']
                })
                .on('end', function() {
                    assert.file('gulp_tasks/common/constants.js');
                    var constantPath = path.join(os.tmpdir(), testHelper.tempFolder, 'gulp_tasks/common/constants.js');

                    // make sure the file is not cached by node as we are requiring it
                    delete require.cache[require.resolve(constantPath)];

                    var constants = require(constantPath)();

                    assert.deepEqual(constants.fonts.src, []);
                    done();
                });
        });

    });
});