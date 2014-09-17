'use strict';

var OsirisService = require('../lib/OsirisService')
  , OsirisEndpoint = require('../lib/OsirisEndpoint')
  , should = require('should')
  , debug = require('debug')('OsirisService');

describe('OsirisService', function() {
  before(function(){
    this.args = {
        endpoints: [process.env.TB_OSIRIS_HOST]
      , credentials: [{
          username: process.env.TB_OSIRIS_USERNAME
        , password: process.env.TB_OSIRIS_PASSWORD
      }]
    };
  });
  describe('default instance', function() {
    beforeEach(function(){
      this.osirisService = new OsirisService();
    });
    it('should be an instanceOf OsirisService'
      , function() {
        this.osirisService.should
            .be.an.instanceOf(OsirisService);
      });
    
    it('should have the property "options"'
      , function() {
        this.osirisService.should.have
            .property('options');
      });
    it('should have empty Array options.endpoints'
      , function() {
        this.osirisService.should.have
            .propertyByPath('options', 'endpoints')
            .which.is.empty
            .and.of.type.Array;
      });
    it('should have empty Array options.credentials'
      , function() {
        this.osirisService.should.have
            .propertyByPath('options', 'credentials')
            .which.is.empty
            .and.of.type.Array;
      });
  });
  describe('configured instance', function() {
    beforeEach(function(){
      this.osirisService = new OsirisService(this.args);
    });
    it('should pass endpoint values from constructor argument'
      , function() {
        should(this.osirisService.options.endpoints)
          .and.eql(this.args.endpoints)
          .and.not.equal(this.args.endpoints);
      });
    it('should pass credential values from constructor argument'
      , function() {
        should(this.osirisService.options.credentials)
          .and.eql(this.args.credentials)
          .and.not.equal(this.args.credentials);
      });
  });
  describe('#createEndpoints(callback)', function(){
    beforeEach(function(){
      this.osirisService = new OsirisService(this.args);
    });

    it('should be a function'
      , function(){
        this.osirisService.createEndpoints.should.be.type('function');
      });
    it('should return self'
      , function(done){
        var ret = this.osirisService.createEndpoints(done);
        this.osirisService.should.equal(ret);
      });

    it('should run in less than 200 ms'
      , sinon.test(function(){
        this.timeout(200);
        var callback = this.spy();
        this.osirisService.createEndpoints(callback);
        this.clock.tick(this.timeout());
        should(callback).have
          .propertyByPath('lastCall', 'args', '1')
          .which.is.instanceOf(Array)
          .with.lengthOf(1);
      }));
    it('should create a "osirisEndpoints" property on the service'
      , sinon.test(function(){
        var svc = this.osirisService;
        this.timeout(200);
        this.osirisService.should
              .not.have.property('osirisEndpoints');
        this.osirisService.createEndpoints(function assertValues(err, res){
          this.should
            .be.instanceof(OsirisService).equal(svc)
            .with.property('osirisEndpoints').equal(res);
        });
        this.clock.tick(this.timeout());
        this.osirisService.should
              .have.property('osirisEndpoints');
      }));
    it('should create OsirisEndpoint instances from service options'
      , sinon.test(function(){
        var len = this.args.credentials.length * this.args.endpoints.length
          , callback = this.spy();
        this.osirisService.createEndpoints(callback);
        this.clock.tick(this.timeout());
        callback.should.have.propertyByPath('lastCall', 'args', '1')
          .which.is.an.Array
          .and.matchEach(function(it) { 
            return it.should.be.an.instanceof(OsirisEndpoint); 
          })
          .with.lengthOf(len);
      }));

    it('should create (endpoints.length * credentials.length) endpoints'
      , sinon.test(function() {
        var endpoints = ['osiris-ash-search-01.osiris.blu.csn.internal'
                       , 'osiris-ash-search-02.osiris.blu.csn.internal'
                       , 'osiris-ash-search-03.osiris.blu.csn.internal'
                       , 'osiris-ash-search-04.osiris.blu.csn.internal']
          , credentials = [{ username: "user_test", password: "changeme"}];

        var len = credentials.length * endpoints.length
          , callback = this.spy()
          , osirisService = new OsirisService({
            endpoints: endpoints
          , credentials: credentials
        });

        osirisService.createEndpoints(callback);
        this.clock.tick(this.timeout());
        callback.should.have.propertyByPath('lastCall', 'args', '1')
          .which.is.an.Array
          .and.matchEach(function(it) { 
            return it.should.be.an.instanceof(OsirisEndpoint); 
          })
          .with.lengthOf(len);
      }));
  });
  describe('#firstEndpoint(callback)', function(){
    beforeEach(function(){
      this.osirisService = new OsirisService(this.args);
      this.osirisEndpoint = { trySplunkLogin: function () {} };
    });

    it('should be a function'
      , function(){
        this.osirisService.firstEndpoint.should.be.type('function');
      });
    it('should return self'
      , sinon.test(function(){
        this.stub(this.osirisService, 'createEndpoints')
            .yields(null, [this.osirisEndpoint]);
        var ret = this.osirisService.firstEndpoint();
        this.clock.tick(this.timeout());
        this.osirisService.should.equal(ret);
      }));

    it('should invoke the callback with (null, OsirisEndpoint) on login'
      , sinon.test(function(){
        this.mock(this.osirisEndpoint)
            .expects("trySplunkLogin")
            .once()
            .yields(null, true);

        var createEndpoints = this.stub(this.osirisService, 'createEndpoints');
            createEndpoints.yields(null, [this.osirisEndpoint]);
        
        var callback = this.stub();
        var ret = this.osirisService.firstEndpoint(callback);
        this.clock.tick(this.timeout());

        callback.called.should.equal(true, 'callback was not called');
        callback.should.have.propertyByPath('lastCall', 'args', '0')
          .which.is.not.ok;
        callback.should.have.propertyByPath('lastCall', 'args', '1')
          .which.is.ok
          .and.equal(this.osirisEndpoint);
      }));
    it('should invoke the callback with an error if no logged in endpoint'
      , sinon.test(function(){
        this.mock(this.osirisEndpoint)
            .expects("trySplunkLogin")
            .once()
            .yields(null, false);

        var createEndpoints = this.stub(this.osirisService, 'createEndpoints');
            createEndpoints.yields(null, [this.osirisEndpoint]);

        var callback = this.stub();
        var ret = this.osirisService.firstEndpoint(callback);
        this.clock.tick(this.timeout());

        callback.called.should.equal(true, 'callback was not called');
        callback.should.have.propertyByPath('lastCall', 'args', '0')
          .which.is.ok;
      }));
  });
});

