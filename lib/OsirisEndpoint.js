'use strict';
(function OsirisEndpoint(){
	exports = module.exports = OsirisEndpoint;

	var _ = require('lodash')
	  , async = require('async')
	  , splunkjs = require('splunk-sdk');

	// *****************************************************
	// START OsirisEndpointBase
	function OsirisEndpointBase() {
	  var self = this
	    , options = this.options = {
					 scheme  : "https"
				 , port    : "8089"
				 , version : "default"}
			, defaultOptionKeys = _.keys(options);

		Object.defineProperties(this, {
		  "defaultOptions": {
		    value: function(){
					return options;
				}
		  },
		  "instanceOptions": {
		    value: function(){
					return _.omit(this.options, defaultOptionKeys);
				}
		  }
		});
	}

	OsirisEndpointBase.prototype.serviceOptions = function(){
		return this.options;
	}
	OsirisEndpointBase.prototype.createSplunkService = function(callback){
		var self = this;
		callback = _.createCallback(callback, self, 2);
		this.splunkService = new splunkjs.Service(this.serviceOptions());
		callback(null, this.splunkService);
	  return self;
	}

	OsirisEndpointBase.prototype.trySplunkLogin = function (done) {
		var self = this;
		done = _.createCallback(done, self, 2);
		async.auto({
			splunkService: function(callback){
				if (self.splunkService) {
					return callback(null, self.splunkService);
				}
				self.createSplunkService(callback);
		  },
		  'loggedIn': ['splunkService', function(callback, ctx){
				ctx.splunkService.login(callback);
		  }]
	  }, function(err, results){
			done(err, results.loggedIn);
	  });
	  return self;
	};
	// END OsirisEndpointBase
	// *****************************************************

	// *****************************************************
	// START OsirisEndpoint
	OsirisEndpoint.prototype = _.create(OsirisEndpointBase.prototype, { 'constructor': OsirisEndpoint });
	function OsirisEndpoint (argObj) {
		OsirisEndpointBase.call(this);
		var superOpts = this.options;
		this.options = _.merge({}, superOpts, argObj);
	}
	// END OsirisEndpoint
	// *****************************************************
})();
