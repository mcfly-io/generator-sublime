'use strict';

var gulp = require('gulp');

require('require-dir')('./gulp/tasks');

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});
