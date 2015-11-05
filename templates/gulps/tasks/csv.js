'use strict';
var gulp = require('gulp');
var csv = require('fast-csv');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var constants = require('../common/constants')();
var BPromise = require('bluebird');

BPromise.promisifyAll(fs);

var readCsv = function(file, cb) {
    return new Promise(function(resolve, reject) {
        csv.fromPath(path.join(file), {
                headers: true,
                delimiter: ';',
                ignoreEmpty: true,
                trim: true
            })
            .on('data', function(data) {
                cb(data);
            })
            .on('error', function(error) {
                reject(error);
            })
            .on('end', function() {
                resolve();
            });
    });

};

gulp.task('csv', 'Converts csv file to json.', function() {
    var dir = constants.csv.dir;
    var files = fs.readdirSync(dir).filter(function(file) {
        return file.indexOf('.csv') > 0;
    });

    return BPromise
        .resolve(files)
        .each(function(file) {
            var sourceFile = path.join(dir, file);
            var destinationFile = path.join(dir, file.replace('.csv', '.json'));
            var isFirst = true;
            return fs.writeFileAsync(destinationFile, '')
                .then(function() {
                    gutil.log(gutil.colors.yellow(sourceFile));
                    fs.appendFileSync(destinationFile, '[');
                })
                .then(function() {

                    return readCsv(sourceFile, function(data) {
                        fs.appendFileSync(destinationFile, !isFirst ? ',' + JSON.stringify(data) : JSON.stringify(data));
                        isFirst = false;
                    });
                })
                .then(function() {
                    fs.appendFileSync(destinationFile, ']');
                });

        });
});
