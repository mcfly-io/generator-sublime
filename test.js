'use strict';

var updateNotifier = require('update-notifier')({pkg : require('./package.json')});

console.log(updateNotifier);