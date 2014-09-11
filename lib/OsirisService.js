var _ = require('lodash')
  , util = require('util')
  , async = require('async')
  , OsirisEndpoint = require('./OsirisEndpoint');

OsirisService.defaultOptions = {
	  endpoints: []
	, credentials: []
};

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


function getOsirisEndpoints(callback, err, results){
	if (err) {
		return callback(err);
	}
	var resultKey = 'osirisEndpoints';
	if (_.has(results, resultKey)) {
			return setTimeout(function(){
				callback(null, _.result(results, resultKey));
			}, 200);
		// return callback(null, _.result(results, resultKey));
	}
	return callback("Unable to create server endpoints at this time");
}

function OsirisService (argObj) {
	this.options = _.merge({}, OsirisService.defaultOptions, argObj, concatMerge);
}

OsirisService.prototype.createServers = function (callback) {
	var self = this;	
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
	}, _.wrap(_.createCallback(callback, self, 2), getOsirisEndpoints));
  return self;
};


