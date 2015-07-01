'use strict';

var gulp = require('gulp');
require('gulp-help')(gulp, {
    hideDepsMessage: true
});

require('require-dir')('./gulp_tasks/tasks');