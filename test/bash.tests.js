'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var testHelper = require('./testHelper')();
var assert = require('yeoman-generator').assert;

describe('sublime bash subgenerator', function() {

    beforeEach(function(done) {
        helpers.testDirectory(path.join(__dirname, 'temp'), function(err) {
            if(err) {
                return done(err);
            }
            var deps = ['../../bash'];
            this.bash = helpers.createGenerator('sublime:bash', deps, ['test/bar.sh']);
            done();
        }.bind(this));
    });

    it('bash should create bash file', function(done) {
        this.bash.run([], function() {
            helpers.assertFile('test/bar.sh');
            done();
        });
    });

    it('bash should create bash file with proper header', function(done) {
        this.bash.run([], function() {
            helpers.assertFile('test/bar.sh');
            var body = testHelper.readTextFile('test/bar.sh');
            var firstLine = body.split('\n')[0].trim();
            assert.equal(firstLine, '#!/bin/bash');
            done();
        });
    });
});