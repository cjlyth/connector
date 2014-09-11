'use strict';
var _ = require('lodash')
  , OsirisService = require('../lib/osiris').OsirisService
  , OsirisEndpoint = require('../lib/osiris').OsirisEndpoint;
var should = require('should');
var endpoints = ['test.com'
               , 'google.com'
               , 'example.com']
  , credentials = [{ username: "chris"
                   , password: "changeme"}
                 , { username: "bob"
                   , password: "changeme"}];

describe('OsirisService', function() {
  it('should be an instanceOf OsirisService'
    , function() {
    (new OsirisService).should
      .be.an.instanceOf(OsirisService);
  });
  it('should have options.endpoints and options.credentials'
    , function() {
    (new OsirisService).should
      .have.property('options')
      .with.keys('endpoints', 'credentials');
  });
  it('should not have default credentials'
    , function() {
    (new OsirisService().options.credentials).should
      .be.an.Array
      .and.empty;
  });
  it('should not have default endpoints'
    , function() {
    (new OsirisService().options.endpoints).should
      .be.an.Array
      .and.empty;
  });
  describe('constructor argument object'
    , function() {
    it('should pass endpoint values {endpoints: ["example.com"]}'
      , function() {
      (new OsirisService({endpoints: endpoints}).options.endpoints)
        .should.be.an.Array
        .and.containEql('example.com')
        .and.have.lengthOf(3);
    });
    it('should pass credentials values {credentials: [{ username: "chris"}]}'
      , function() {
      (new OsirisService({credentials: credentials}).options.credentials)
        .should.be.an.Array
        .and.containEql(credentials[0])
        .and.have.lengthOf(2);
    });
  });

  describe('#createEndpoints(callback)', function(){
    it('should be a function'
      , function(){
      new OsirisService({
          credentials:credentials
        , endpoints: endpoints
      }).createEndpoints.should.be.type('function');
    });
    it('should return self'
      , function(){
      var s = new OsirisService({
          credentials: credentials
        , endpoints:   endpoints
      });
      s.should.equal(s.createEndpoints());
    });

    describe('execution callback', function(){
      beforeEach(function(){
        this.osirisService = new OsirisService({
            credentials: credentials
          , endpoints: endpoints
        });
      });
      it('should run in less than 500 ms'
        , sinon.test(function(){
              this.timeout(500);
              var callback = this.spy();
              this.osirisService.createEndpoints(callback);
              this.clock.tick(this.timeout());
              should(callback).have
                .propertyByPath('lastCall', 'args', '1')
                .which.is.instanceOf(Array);
            }));
      it('should create a "osirisEndpoints" property on the service'
        , function(){
        var svc = this.osirisService;
        this.osirisService.should
            .not.have.property('osirisEndpoints');
        this.osirisService.createEndpoints(function assertValues(err, res){
          this.should
            .be.instanceof(OsirisService)
              .equal(svc)
            .with.property('osirisEndpoints')
              .equal(res);
          return err;
        });
      });
      it('should create OsirisEndpoint instances from service options'
        , sinon.test(function(){
          var callback = this.spy();
          this.osirisService.createEndpoints(callback);
          this.clock.tick(this.timeout());
          callback.should.have.propertyByPath('lastCall', 'args', '1')
            .which.is.an.Array
            .and.matchEach(function(it) { 
              return it.should.be.an.instanceof(OsirisEndpoint); 
            })
            .with.lengthOf(credentials.length * endpoints.length);
        }));
    });
  });
});