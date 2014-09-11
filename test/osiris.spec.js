'use strict';

var osiris = require('../lib/osiris');

describe('osiris', function() {
	it('should expose public constructors', function () {
    osiris.OsirisEndpoint.should.be.type('function');
    osiris.OsirisService.should.be.type('function');
  });
});
