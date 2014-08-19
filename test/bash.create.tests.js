'use strict';
var assert = require('assert');

describe('sublime bash subgenerator', function() {
    it('can be imported without blowing up', function() {
        var bash = require('../bash');
        assert(bash !== undefined);
    });
});