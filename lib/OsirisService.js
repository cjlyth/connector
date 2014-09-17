'use strict';
(function OsirisService(){
	exports = module.exports = OsirisService;

	var _ = require('lodash')
	  , async = require('async')
	  , OsirisEndpoint = require('./OsirisEndpoint')
	  , AsyncBuilder = require('./AsyncBuilder');

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

	function concatMerge(from, to) {
		if (_.isArray(from)) {
			return from.concat(to); 
		}
		return undefined;
	}

	function tryOsirisEndpointsLogin(callback, osirisEndpoints) {
		if (!_.isArray(osirisEndpoints) || _.isEmpty(osirisEndpoints)) {
			return callback('Cannot try login without osiris endpoints');
		}
		async.detect(osirisEndpoints
			, function(osirisEndpoint, callback){
			 	osirisEndpoint.trySplunkLogin(function(err, res){
			   	return callback(!err && !!res);
			 	});
			}, function(result){
				if (result) {
					return callback(null, result);  
				}
				callback("Unable to find an endpoint that could login");
			});
	}

	function OsirisService (argObj) {
		var self = this;		
		this.osirisEndpointsKey = 'osirisEndpoints';
		this.options = _.merge({endpoints: [], credentials: []}, argObj, concatMerge);

		Object.defineProperties(this, {
			"asyncTasks": {
				value: {
						'osirisService': [function(done){
							done(null, self);
						}]
					, 'endpoint': ['osirisService', function(done, ctx){
				  		ctx.osirisService.firstEndpoint(done);
				    }]
					, 'splunk': ['endpoint', function(done, ctx){
							done(null, ctx.endpoint.splunkService);
			  		}]
			  	, 'username':  ['endpoint', function(done, ctx){
				  		done(null, ctx.endpoint.options.username);
				  	}]
				  , 'jobs':  ['splunk', 'username', function(done, ctx){
				  		var filter = {search: ctx.username};
					  	ctx.splunk.jobs().fetch(filter, function(err, jobs){
					  		if (err) {
					  			return done(err);
					  		}
								if (!jobs || !jobs.list) {
									return done('Error fetching jobs');
								}
								done(null, jobs.list());
					  	});
				  	}]
				}
			},
		  "builder": {
		    get: function(){
		    	var self = this;
		    	return new AsyncBuilder(self.asyncTasks);
				}
		  }
		});
	}

	OsirisService.prototype.firstEndpoint = function (done) {
		var self = this;
		done = _.createCallback(done, self, 2);
    async.auto({
      'osirisEndpoints': function(callback){
        if (self.osirisEndpoints) {
          return callback(null, self.osirisEndpoints);
        }
        self.createEndpoints(callback);
      },
      'osirisEndpoint': ['osirisEndpoints', function(callback, ctx){
				tryOsirisEndpointsLogin(callback, ctx.osirisEndpoints);
      }]
    }, function(err, results){
    	done(err, results.osirisEndpoint);
    }); 
	  return self;
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
	
	OsirisService.prototype.listJobs = function (done) {
		this.builder.result('jobs', done);
		return this;
	};
})();
