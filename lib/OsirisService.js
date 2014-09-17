'use strict';
(function OsirisService() {
  exports = module.exports = OsirisService;

  var _ = require('lodash'),
    async = require('async'),
    OsirisEndpoint = require('./OsirisEndpoint'),
    AsyncBuilder = require('./AsyncBuilder');

  function createEndpointConfig(v) {
    return {
      'host': v
    };
  }

  function toServiceOption(configSetEntry) {
    return _.chain(configSetEntry)
      .map(_.pairs)
      .flatten(true)
      .zipObject().value();
  }

  function cartesianProduct() {
    return _.reduce(arguments, function(a, b) {
      return _.flatten(_.map(a, function(x) {
        return _.map(b, function(y) {
          return x.concat([y]);
        });
      }), true);
    }, [[]]);
  }

  function concatMerge(from, to) {
    if (_.isArray(from)) {
      return from.concat(to);
    }
    return undefined;
  }

  var assignOsirisEndpoints = _.curry(createEndpointsCallback)
    , osirisEndpointsKey = 'osirisEndpoints';
  function createEndpointsCallback(osirisService, done, err, osirisEndpoints){
  	done = _.createCallback(done, osirisService, 2);
    if (err) {
      return done(err);
    }
    osirisService[osirisEndpointsKey] = osirisEndpoints;
    done(null, osirisEndpoints);
  };

  var osirisServiceTasks = {
  	'osirisEndpoint': ['osirisEndpoints', function(done, ctx) {
  		// console.log('osirisServiceTasks', 'osirisEndpoint');
			async.detect(ctx.osirisEndpoints, function(osirisEndpoint, callback) {
			  osirisEndpoint.trySplunkLogin(function(err, res) {
			    return callback(!err && !!res);
			  });
			}, function(result) {
			  if (result) {
			    return done(null, result);
			  }
			  done("Unable to find an endpoint that could login");
			});
    }],
		'credentials': ['options', function(callback, ctx) {
			// console.log('osirisServiceTasks', 'credentials');
    	callback(null, ctx.options.credentials);
    }],
    'configSet': ['endpoints', 'credentials', function(callback, ctx) {
    	// console.log('osirisServiceTasks', 'configSet');
    	callback(null, cartesianProduct(ctx.endpoints, ctx.credentials));
    }],
    'endpointArgs': ['configSet', function(callback, ctx) {
    	// console.log('osirisServiceTasks', 'endpointArgs');
    	callback(null, _.map(ctx.configSet, toServiceOption));
    }],
    'osirisEndpoints': ['osirisService','endpointArgs', function(callback, ctx) {
    	// console.log('osirisServiceTasks', 'osirisEndpoints');
    	if (ctx.osirisService.osirisEndpoints) {
    		return callback(null,ctx.osirisService.osirisEndpoints);
    	}
	    callback(null, _.map(ctx.endpointArgs, function(endpointArgs) {
	      return new OsirisEndpoint(endpointArgs);
	    }));
    }],

  	'endpoints': ['hosts', function(callback, ctx) {
  		// console.log('osirisServiceTasks', 'endpoints');
    	callback(null, ctx.hosts.map(createEndpointConfig));
    }],
  	'hosts': ['options', function(done, ctx) {
  		// console.log('osirisServiceTasks', 'hosts');
  		done(null, ctx.options.endpoints);
		}],
  	'options': ['osirisService', function(done, ctx) {
  		// console.log('osirisServiceTasks', 'options');
			done(null, ctx.osirisService.options);
 		}],
    'endpoint': ['osirisService', function(done, ctx) {
    	// console.log('osirisServiceTasks', 'endpoint');
    	ctx.osirisService.firstEndpoint(done);
    }],
    'splunk': ['endpoint', function(done, ctx) {
    	// console.log('osirisServiceTasks', 'splunk');
    	done(null, ctx.endpoint.splunkService);
    }],
    'username': ['endpoint', function(done, ctx) {
    	// console.log('osirisServiceTasks', 'username');
    	done(null, ctx.endpoint.options.username);
    }],
    'jobs': ['splunk', 'username', function(done, ctx) {
    	// console.log('osirisServiceTasks', 'jobs');
	    var filter = {
	      search: ctx.username
	    };
	    ctx.splunk.jobs().fetch(filter, function(err, jobs) {
	      if (err) {
	        return done(err);
	      }
	      if (!jobs || !jobs.list) {
	        return done('Error fetching jobs');
	      }
	      done(null, jobs.list());
	    });
	  }]
  };

  function OsirisService(argObj) {
    var self = this;
    this.options = _.merge({
      endpoints: [],
      credentials: []
    }, argObj, concatMerge);

   	Object.defineProperties(this, {
      "asyncTasks": {
      	get: function(){
      		var self = this;
      		return _.assign({
      			'osirisService': function(done){
      				done(null, self);
      			}
      		},osirisServiceTasks);
      	}
      },
      "builder": {
        get: function() {
          var self = this;
          return new AsyncBuilder(self.asyncTasks);
        }
      }
    });
  }

  OsirisService.prototype.firstEndpoint = function(done) {
  	var self = this;
  	done = _.createCallback(done, self, 2);
  	self.builder.result(done, 'osirisEndpoint');
  	return this;
  }
  OsirisService.prototype.createEndpoints = function(done) {
  	var self = this;
  	self.builder.result(assignOsirisEndpoints(self, done), 'osirisEndpoints');
  	return this;
  };
  OsirisService.prototype.listJobs = function(done) {
  	this.builder.result(done, 'jobs');
  	return this;
  };
})();


	   //    Object.defineProperty(ret, 'inspect', {
	   //    	value: function(depth) {
	   //    		depth > 
	   //    		console.log(depth);
	   //    		return this;
				//   	// return '{' + this.name + '}';
				// 	}
				// });
