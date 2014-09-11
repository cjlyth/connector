'use strict';

var _ = require('lodash')
  , async = require('async')
  , OsirisEndpoint = require('./OsirisEndpoint');

exports = module.exports = OsirisService;

function concatMerge(from, to) {
	if (_.isArray(from)) {
		return from.concat(to); 
	}
	return undefined;
}
function createEndpointConfig(v){
	return {'host':v};
}
function toServiceOption(configSetEntry){	
	return _.chain(configSetEntry)
					.map(_.pairs)
					.flatten(true)
					.zipObject().value();
}
function cartesianProduct(){
	return _.reduce(arguments, function(a, b) {
		return _.flatten(_.map(a, function(x) {
			return _.map(b, function(y) {
				return x.concat([y]);
			});
		}), true);
	}, [[]]);
}   
function createEndpointsCallback(doneFn, err, results){
	if (!_.isNull(err)) {
		return doneFn(err);
	}
	var resultKey = this.osirisEndpointsKey
	  , osirisEndpoints = _.result(results, resultKey);

	if (this instanceof OsirisService) {
		this[resultKey] = osirisEndpoints;
	}	
	return doneFn(null, osirisEndpoints);
}

OsirisService.prototype = {
	osirisEndpointsKey: 'osirisEndpoints'
}

function OsirisService (argObj) {
	this.options = _.merge({
	  endpoints: []
	, credentials: []
	}, argObj, concatMerge);
}

OsirisService.prototype.firstEndpoint = function (callback) {
	var self = this;

	async.detect(self.osirisEndpoints, trySplunkLogin, _.wrap(null, callback));
	return this;
}

OsirisService.prototype.createEndpoints = function (callback) {
	var self = this;
	callback = _.wrap(_.createCallback(callback, self, 2)
									, _.createCallback(createEndpointsCallback, self, 3));
	async.auto({
		options: function(callback){
			callback(null, self.options);
	  },
	  'hosts': ['options', function(callback, ctx){
	  	callback(null, ctx.options.endpoints);
	  }],
	  'endpoints': ['hosts', function(callback, ctx){
	  	callback(null, ctx.hosts.map(createEndpointConfig));
	  }],
	  'credentials': ['options', function(callback, ctx){
	  	callback(null, ctx.options.credentials);
	  }],
	  'configSet': ['endpoints', 'credentials', function(callback, ctx){
	  	callback(null, cartesianProduct(ctx.endpoints, ctx.credentials));
	  }],
	  'endpointArgs': ['configSet', function(callback, ctx){
	  	callback(null, _.map(ctx.configSet,toServiceOption));
	  }],
	  'osirisEndpoints': ['endpointArgs', function(callback, ctx){
	  	callback(null, _.map(ctx.endpointArgs, function(endpointArgs){
	  		return new OsirisEndpoint(endpointArgs);
	  	}));
	  }]
	  }, callback);
  return self;
};


