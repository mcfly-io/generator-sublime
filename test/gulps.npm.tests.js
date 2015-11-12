'use strict';

var path = require('path');
var helpers = require('yeoman-generator').test;
var testHelper = require('./testHelper')();
//var mockery = require('mockery');
var os = require('os');

var generator = '../gulps';
var error;
require('./helpers/globals');

describe('sublime:gulps npm', function() {
    before(function() {
        //testHelper.startMock(mockery);
        // mockery.registerMock('child_process', {
        //     exec: function(cmd, cb) {
        //         cb(new Error('npm error'));
        //     }
        // });
    });

    beforeEach(function(done) {

        var defaultOptions = {};
        error = new Error();
        this.runGen = helpers.run(path.join(__dirname, generator))
            .inDir(path.join(os.tmpdir(), testHelper.tempFolder))
            .withOptions(defaultOptions)
            .on('ready', function(generator) {
                generator.npmInstall = function(packages, options, cb) {
                    if (cb) {
                        cb(error);
                    } else {
                        throw error;
                    }
                };
                done();
            });

    });

    it('when npm fail should emit an error', function(done) {
        this.runGen.withPrompts({
                'Tasks': ['lint']
            })
            .on('error', function(err) {
                //console.log(err);
                assert.equal(err, error);
                done();
            });
    });

    after(function() {
        //testHelper.endMock(mockery);
    });

});
