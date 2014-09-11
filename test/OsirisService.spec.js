'use strict';
var _ = require('lodash')
  , async = require('async')
  , util = require('util')
  , OsirisService = require('../lib/osiris').OsirisService;

var endpoints = ['test.com'
              , 'google.com'
              , 'example.com']
  , credentials = [{ username: "chris"
                       , password: "changeme"}
                  , { username: "bob"
                       , password: "changeme"}];

describe('OsirisService', function() {
  it('should be an instanceOf OsirisService', function() {
    var osirisService = new OsirisService;
    osirisService.should.be.an.instanceOf(OsirisService);
  });

  describe('defaultOptions', function() {
    it('should be accessable on the constructor', function() {
      (OsirisService).should.have.property('defaultOptions');   
    });
    it('should not be accessable on an instance', function() {
      (new OsirisService()).should.not.have.property('defaultOptions');   
    }); 
    it('should be an Object', function() {
      (OsirisService.defaultOptions).should.be.an.Object;   
    });
    it('should have keys endpoints, credentials', function() {
      (OsirisService.defaultOptions).should.have.keys('endpoints', 'credentials');
    });

    describe('global access', function() {
      beforeEach(function(){
        this.defaultOptions = OsirisService.defaultOptions;
        OsirisService.defaultOptions = _.cloneDeep(this.defaultOptions);
      });
      it('should combine with constructor args', function() {
        OsirisService.defaultOptions.credentials.push(credentials[0]);
        new OsirisService({
          credentials: [credentials[1]]
        }).options.credentials
          .should.be.an.Array
          .and.containDeep([credentials[0]])
          .and.containDeep([credentials[1]])
          .and.have.lengthOf(2);
      });
      it('should allow global defaults', function() {

        OsirisService.defaultOptions.credentials
            .should.be.an.Array
            .and.have.lengthOf(0);
        
        var s0 = new OsirisService;
        s0.options.credentials
          .should.be.an.Array
          .and.have.lengthOf(0);

        OsirisService.defaultOptions.credentials.push(credentials[0]);
        OsirisService.defaultOptions.credentials
            .should.be.an.Array
            .and.containDeep([credentials[0]])
            .and.have.lengthOf(1);

        var s1 = new OsirisService;
        s1.options.credentials
          .should.be.an.Array
          .and.containDeep([credentials[0]])
          .and.have.lengthOf(1);

        s0.options.credentials
          .should.be.an.Array
          .and.have.lengthOf(0);

        OsirisService.defaultOptions.credentials.push(credentials[0]);
        // (OsirisService.defaultOptions).should.have.keys('endpoints', 'credentials');
      });
      afterEach(function(){
        OsirisService.defaultOptions = this.defaultOptions;
      });

    });
  });

  describe('options', function() {
    describe('credentials', function() {
      it('should be an empty array by default', function() {
        (new OsirisService().options.credentials).should.be.an.Array.and.empty;
        (new OsirisService({}).options.credentials).should.be.an.Array.and.empty;
      });
    });
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
      it('should not share endpoints across instances', function() {
        var osirisService0 = new OsirisService();
        osirisService0.options.endpoints
          .should.be.an.Array
          .and.have.lengthOf(0);
        osirisService0.options.endpoints.push('google.com');

        var osirisService1 = new OsirisService();
        osirisService1.options.endpoints
          .should.be.an.Array
          .and.have.lengthOf(0);
        osirisService1.options.endpoints.push('example.com');

        osirisService0.options.endpoints
          .should.be.an.Array
          .and.containEql('google.com')
          .and.have.lengthOf(1);

        osirisService1.options.endpoints
          .should.be.an.Array
          .and.containEql('example.com')
          .and.have.lengthOf(1);
      });
    });
  });
  describe('createServers(callback)', function(){
    it('should be a function', function(){
      new OsirisService({
          credentials:credentials
        , endpoints: endpoints
      }).createServers.should.be.type('function');
    });
    it('should return self', function(){
      var s = new OsirisService({
          credentials:credentials
        , endpoints: endpoints
      });
      s.should.equal(s.createServers());
    });
    describe('execution callback', function(){
      beforeEach(function(){
        this.clock = sinon.useFakeTimers();
      });
      afterEach(function(){
        this.clock.restore();
      });
      it('should transform host names into OsirisEndpoint instances in less than 200 ms', function(){
        this.timeout(200);
        var s = new OsirisService({
            credentials: credentials
          , endpoints: endpoints
        });

        var callback = sinon.spy();
        s.createServers(callback);
        this.clock.tick(200);

        callback.called.should.equal.true;
        callback.calledOnce.should.equal.true;

        var spyCall = callback.lastCall;
        spyCall.should.have.property('exception').equal(undefined);
        spyCall.should.have.property('returnValue').equal(undefined);
        spyCall.should.have.property('args')
          .and.be.an.Array
          .and.have.lengthOf(2);
        (null === spyCall.args[0]).should.be.true;
        spyCall.args[1].should.be.ok
          .and.be.an.Array
          .and.have.lengthOf(credentials.length * endpoints.length)
          .and.matchEach(function(it) { return it.instanceof(OsirisEndpoint); });;
      });
    });
  });
});
