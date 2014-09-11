'use strict';
var OsirisService = require('../lib/osiris').OsirisService;

describe('OsirisService', function() {
  it('should be an instanceOf OsirisService', function() {
    var osirisService = new OsirisService;
    osirisService.should.be.an.instanceOf(OsirisService);
  });

  describe('options', function() {
    describe('endpoints', function() {
      it('should be an empty array by default', function() {
        (new OsirisService().options.endpoints).should.be.an.Array.and.empty;
        (new OsirisService({}).options.endpoints).should.be.an.Array.and.empty;
      });
      it('should be ["example.com"] when constructed with {endpoints: ["example.com"]}', function() {
        (new OsirisService({endpoints: ["example.com"]}).options.endpoints)
          .should.be.an.Array
          .and.containEql('example.com')
          .and.have.lengthOf(1)
          ;
          // 
      });
    });
  });
});
