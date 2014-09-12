'use strict';
var fs = require('fs');
var _ = require('lodash');
var assert = require('assert');
var stripJsonComments = require('strip-json-comments');

module.exports = function() {
    var readTextFile = function(filename) {
        var body = fs.readFileSync(filename, 'utf8');
        return body;
    };

    var readJsonFile = function(filename) {
        var body = readTextFile(filename);
        return JSON.parse(stripJsonComments(body));
    };

    var githubUserMock = {
        user: 'thaiat',
        name: 'Avi Haiat',
        email: 'imp@yoobic.com',
        html_url: 'https://github.com/imp'
    };

    var githubMock = function() {
        return {
            user: {
                getFrom: function(data, cb) {
                    var err = null;
                    var res = githubUserMock;
                    cb(err, res);
                }
            }
        };
    };

    var childProcessMock = {

        exec: function(cmd, cb) {
            assert(_.isString(cmd), 'cmd should be a string');
            if(cmd === 'cat ~/.npmrc | grep \'email\'') {
                cb(null, 'email=' + githubUserMock.email);
            } else if(cmd === 'cat ~/.npmrc | grep \'_auth\'') {
                cb(null, '_auth=dxxsdsdfsd');
            } else {
                cb(null, '');
            }
        },
        spawn: function(cmd) {
            assert(_.isString(cmd), 'cmd should be a string');
            return {
                on: function(name, cb) {
                    cb();
                }
            };
        }

    };

    var npmMock = {
        load: function(cb) {
            cb(null, this);
        },
        login: function(cb) {
            cb();
        }
    };

    var updateNotifierMock = function(update, callback) {
        return {
            update: update,
            notify: callback
        };
    };
    var shelljsMock = function(cb) {
        return {
            exit: cb
        };
    };

    var startMock = function(mockery) {
        //mockery.disable();
        mockery.enable({
            warnOnUnregistered: false,
            useCleanCache: true
        });
    };

    var endMock = function(mockery) {
        mockery.disable();
        mockery.deregisterAll();
    };

    return {
        tempFolder: './temp-test',
        readTextFile: readTextFile,
        readJsonFile: readJsonFile,
        githubUserMock: githubUserMock,
        githubMock: githubMock,
        childProcessMock: childProcessMock,
        npmMock: npmMock,
        updateNotifierMock: updateNotifierMock,
        shelljsMock: shelljsMock,
        startMock: startMock,
        endMock: endMock
    };

};