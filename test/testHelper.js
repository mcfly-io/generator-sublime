'use strict';
var fs = require('fs');
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

    return {
        readTextFile: readTextFile,
        readJsonFile: readJsonFile
    };

};