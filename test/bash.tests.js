'use strict';

var path = require('path');
var helpers = require('yeoman-generator').test;
var testHelper = require('./testHelper')();
var assert = require('yeoman-generator').assert;
var os = require('os');

describe('sublime bash subgenerator', function() {

    var testFile = 'test/bar.sh';
    var generator = '../bash';

    beforeEach(function(done) {
        helpers.run(path.join(__dirname, generator))
            .inDir(path.join(os.tmpdir(), testHelper.tempFolder))
            .withArguments(testFile, '--force')
            .on('end', done);
    });

    it('bash should create bash file', function() {
        assert.file(testFile);
    });

    it('bash should create bash file with proper header', function() {
        assert.file(testFile);
        var body = testHelper.readTextFile(testFile);
        var firstLine = body.split('\n')[0].trim();
        assert.equal(firstLine, '#!/bin/bash');
    });

});