'use strict';

var osiris = require('../lib/osiris');

describe.skip('osiris', function() {
	it('should expose public constructors', function () {
    osiris.OsirisEndpoint.should.be.type('function');
    osiris.OsirisService.should.be.type('function');
  });

  describe('OsirisService', function() {
  	it('should construct without error', function () {
			(function(){
				var osirisService = new osiris.OsirisService({
						endpoints: [
							'osiris-ash-search-01.osiris.blu.csn.internal'
						, 'osiris-ash-search-02.osiris.blu.csn.internal'
						, 'osiris-ash-search-03.osiris.blu.csn.internal'
						, 'osiris-ash-search-04.osiris.blu.csn.internal']
					, credentials: [
							{ username: "clyth", password: "Zmt8CBvWPOV%JQJ1"}
						, { username: "user_test", password: "changeme"}]
				});
				osirisService.options.endpoints.should.have.lengthOf(4);
				osirisService.options.credentials.should.have.lengthOf(2);
			}).should.not.throw();
	  });
  });
});




// var _ = require('lodash');
// function Base(){

// }
// Base.prototype.name = "tj";

// describe('objects', function() {
// 	it('should expose public constructors', function () {
// 		var o1 = _.create(Base.prototype, {
// 			'name': 'chris'
// 		});
// 		var o2 = _.create(Base.prototype);
		
// 		o2.name = 'john';
// 		var o3 = _.create(Base.prototype);
// 		o1.should.be.an.instanceOf(Base)
// 			.and.an.instanceOf(Object)
// 			.and.have.property('name', 'chris');

// 		o2.should.be.an.instanceOf(Base)
// 			.and.an.instanceOf(Object)
// 			.and.have.property('name', 'john');
		
// 		o3.should.be.an.instanceOf(Base)
// 			.and.an.instanceOf(Object)
// 			.and.have.property('name', 'tj');
//   });
// });

// _.defaults(object, { 'name': 'fred', 'employer': 'slate' });