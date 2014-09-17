'use strict';

var OsirisEndpoint = require('../lib/OsirisEndpoint')
  , splunkjs = require('splunk-sdk')
  , should = require('should')
  , debug = require('debug')('OsirisEndpoint');

describe('OsirisEndpoint', function() {
  before(function(){
    this.args = {
      host: process.env.TB_OSIRIS_HOST
      , username: process.env.TB_OSIRIS_USERNAME
      , password: process.env.TB_OSIRIS_PASSWORD
    };
  });
  describe('default instance', function() {
    beforeEach(function(){
      this.osirisEndpoint = new OsirisEndpoint;
    });
    it('should be an instanceOf OsirisEndpoint'
      , function() {
        this.osirisEndpoint.should
            .be.an.instanceOf(OsirisEndpoint);
      });
    it('should have the property "options"'
      , function() {
        this.osirisEndpoint.should.have
            .property('options');
      });

    it('should have non empty string property options.scheme'
      , function() {
        this.osirisEndpoint.should.have
            .propertyByPath('options', 'scheme')
            .which.is.not.empty
            .and.of.type.String;
      });
    it('should have non empty string property options.port'
      , function() {
        this.osirisEndpoint.should.have
            .propertyByPath('options', 'port')
            .which.is.not.empty
            .and.of.type.String;
      });
    it('should have non empty string property options.version'
      , function() {
        this.osirisEndpoint.should.have
            .propertyByPath('options', 'version')
            .which.is.not.empty
            .and.of.type.String;
      });
  });
  describe('configured instance', function() {
    beforeEach(function(){
      this.osirisEndpoint = new OsirisEndpoint(this.args);
    });
    it('should pass host from constructor argument'
      , function() {
        should(this.osirisEndpoint.options.host)
          .and.eql(this.args.host);
      });
    it('should pass username from constructor argument'
      , function() {
        should(this.osirisEndpoint.options.username)
          .and.eql(this.args.username);
      });
    it('should pass password from constructor argument'
      , function() {
        should(this.osirisEndpoint.options.password)
          .and.eql(this.args.password);
      });
  });


  describe('#trySplunkLogin(callback)', function(){
    beforeEach(function(){
      this.osirisEndpoint = new OsirisEndpoint(this.args);
      this.splunkService = { login: function () {} };
    });
    it('should be a function'
      , function(){
        this.osirisEndpoint.trySplunkLogin.should.be.type('function');
      });
    it('should return self'
      , sinon.test(function(){
        var createSplunkServiceStub = this
            .stub(this.osirisEndpoint, 'createSplunkService')
            .yields(null, this.splunkService);

        var ret = this.osirisEndpoint.trySplunkLogin();
        this.clock.tick(this.timeout());
        this.osirisEndpoint.should.equal(ret);
        createSplunkServiceStub.called.should.be.true;
      }));

    it('should invoke the callback with (null, true) when successful'
      , sinon.test(function(){
        this.mock(this.splunkService)
            .expects("login").once()
            .yields(null, true);

        var createSplunkServiceStub = this
            .stub(this.osirisEndpoint, 'createSplunkService')
            .yields(null, this.splunkService);

        var callback = this.stub();
        this.osirisEndpoint.trySplunkLogin(callback);
        this.clock.tick(this.timeout());

        callback.called.should.equal(true, 'callback was not called');

        callback.should.have.propertyByPath('lastCall', 'args', '0')
          .which.is.not.ok;
        callback.should.have.propertyByPath('lastCall', 'args', '1')
          .which.equal(true);

        createSplunkServiceStub.called.should.be.true;
      }));
    it('should invoke the callback with (err, false) when unsuccessful'
      , sinon.test(function(){
        this.mock(this.splunkService)
            .expects("login").once()
            .yields(null, false);

        var createSplunkServiceStub = this
            .stub(this.osirisEndpoint, 'createSplunkService')
            .yields(null, this.splunkService);

        var callback = this.stub();
        this.osirisEndpoint.trySplunkLogin(callback);
        this.clock.tick(this.timeout());

        callback.called.should.equal(true, 'callback was not called');

        callback.should.have.propertyByPath('lastCall', 'args', '0')
          .which.is.not.ok;
        callback.should.have.propertyByPath('lastCall', 'args', '1')
          .which.equal(false);

        createSplunkServiceStub.called.should.be.true;
      }));
  });
  describe('#createSplunkService(callback)', function(){
    beforeEach(function(){
      this.osirisEndpoint = new OsirisEndpoint(this.args);
    });
    it('should be a function'
      , function(){
        this.osirisEndpoint.createSplunkService.should.be.type('function');
      });
    it('should return self'
      , sinon.test(function(){
        var ret = this.osirisEndpoint.createSplunkService();
        this.clock.tick(this.timeout());
        this.osirisEndpoint.should.equal(ret);
      }));

    it('should run in less than 200 ms'
      , sinon.test(function(){
        this.timeout(200);
        var callback = this.spy();
        this.osirisEndpoint.createSplunkService(callback);
        this.clock.tick(this.timeout());
        should(callback).have
          .propertyByPath('lastCall', 'args', '1');
      }));

    it('should create a "splunkService" property on the endpoint'
      , sinon.test(function(){
        var svc = this.osirisEndpoint;
        this.timeout(200);
        this.osirisEndpoint.should
              .not.have.property('splunkService');
        this.osirisEndpoint.createSplunkService(function (err, res){
          this.should
            .be.instanceof(OsirisEndpoint).equal(svc)
            .with.property('splunkService').equal(res);
        });
        this.clock.tick(this.timeout());
        this.osirisEndpoint.should
              .have.property('splunkService');
      }));

    it('should create an instance of splunkjs.Service on the endpoint'
      , sinon.test(function(){
        var callback = this.spy();
        this.osirisEndpoint.createSplunkService(callback);
        this.clock.tick(this.timeout());
        callback.should.have.propertyByPath('lastCall', 'args', '1')
          .which.is.an.instanceOf(splunkjs.Service);
      }));
    
  });
});
