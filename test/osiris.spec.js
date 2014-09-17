'use strict';

var should = require('should')
  , osiris = require('../lib/osiris')
  , debug = require('debug')('osiris');

describe('env', function() {
  it('should have required variables', function() {
    should(process.env.TB_OSIRIS_HOST).be.ok;
    should(process.env.TB_OSIRIS_PORT).be.ok;
    should(process.env.TB_OSIRIS_TIMEOUT).be.ok;
    should(process.env.TB_OSIRIS_PATH).be.ok;
    should(process.env.TB_OSIRIS_USERNAME).be.ok;
    should(process.env.TB_OSIRIS_PASSWORD).be.ok;
  });
});

describe('osiris', function() {
	it('should expose public constructors', function () {
    osiris.OsirisEndpoint.should.be.type('function');
    osiris.OsirisService.should.be.type('function');
  });
});





  // describe.skip('OsirisService', function() {
  // 	it('should construct without error', function () {
		// 	(function(){
		// 		var osirisService = new osiris.OsirisService({
		// 				endpoints: [
		// 					'osiris-ash-search-01.osiris.blu.csn.internal'
		// 				, 'osiris-ash-search-02.osiris.blu.csn.internal'
		// 				, 'osiris-ash-search-03.osiris.blu.csn.internal'
		// 				, 'osiris-ash-search-04.osiris.blu.csn.internal']
		// 			, credentials: [
		// 					{ username: "clyth", password: "Zmt8CBvWPOV%JQJ1"}
		// 				, { username: "user_test", password: "changeme"}]
		// 		});
		// 		osirisService.options.endpoints.should.have.lengthOf(4);
		// 		osirisService.options.credentials.should.have.lengthOf(2);
		// 	}).should.not.throw();
	 //  });
  // });
