'use strict';

var fs = require('fs');
var isMobile = exports.isMobile = function(constants) {
    return fs.existsSync('./' + constants.clientFolder + '/config' + constants.targetSuffix + '.xml');
};

var getMobileDestinationFolder = exports.getMobileDestinationFolder = function(destFolder, constants) {
    var dest = destFolder;
    if(isMobile(constants)) {
        dest = dest + '/www';
    }
    return dest;
};
