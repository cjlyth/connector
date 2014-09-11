'use strict';
var OsirisEndpoint = require('../lib/osiris').OsirisEndpoint;

describe('OsirisEndpoint', function() {
  it('should be an instanceOf OsirisEndpoint', function() {
    var osirisEndpoint = new OsirisEndpoint;
    osirisEndpoint.should.be.an.instanceOf(OsirisEndpoint);
  });

  describe('options', function() {
    describe('host', function() {
      it('should be null by default', function() {
        (new OsirisEndpoint().options).should.have.property('host').equal(null);
        (new OsirisEndpoint({}).options).should.have.property('host').equal(null);
      });
      it('should be null when constructed with {host: ""}', function() {
        (new OsirisEndpoint({host: ""}).options).should.have.property('host').equal(null);
      });
      it('should be "example.com" when constructed with {host: "example.com"}', function() {
        (new OsirisEndpoint({host: "example.com"}).options).should.property('host', 'example.com');
      });
    });
  });
});
