'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var mockery = require('mockery');
var testHelper = require('./testHelper')();
var os = require('os');

var generator = '../app';

describe('sublime:app notifier', function() {

    var defaultOptions;
    var notifierCallback;
    var exitCallback;
    before(function() {

        //shell = sinon.mock(require('shelljs'), 'exit');

        notifierCallback = sinon.spy();
        exitCallback = sinon.spy();
        testHelper.endMock(mockery);
        testHelper.startMock(mockery);
        mockery.registerMock('github', testHelper.githubMock);
        mockery.registerMock('child_process', testHelper.childProcessMock);
        mockery.registerMock('npm', testHelper.npmMock);
        mockery.registerMock('shelljs', testHelper.shelljsMock.call(this, exitCallback));
        mockery.registerMock('update-notifier', testHelper.updateNotifierMock.bind(this, {
            latest: '100.0.0'
        }, notifierCallback));

        defaultOptions = {
            'skip-welcome-message': true,
            checkTravis: false
        };

        this.runGen = helpers.run(path.join(__dirname, generator))
            .inDir(path.join(os.tmpdir(), testHelper.tempFolder))
            .withOptions(defaultOptions);

    });

    it('with obsolete version should notify', function(done) {

        this.runGen.withOptions({
            'skip-welcome-message': true
        }).on('end', function() {
            assert.equal(notifierCallback.callCount, 1);
            sinon.assert.called(exitCallback);
            done();
        });

    });

    after(function() {
        testHelper.endMock(mockery);
    });
});