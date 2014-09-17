// exports = module.exports = require('./lib/osiris');
'use strict';

require('./test/support/env');

var util = require('util')
  , _ = require('lodash')
  , async = require('async')
  , osiris = require('./lib/osiris')
  , debug = require('debug');

debug = debug('osiris');


var endpoints = ['osiris-ash-search-01.osiris.blu.csn.internal'
							 , 'osiris-ash-search-02.osiris.blu.csn.internal'
							 , 'osiris-ash-search-03.osiris.blu.csn.internal'
							 , 'osiris-ash-search-04.osiris.blu.csn.internal']
  , credentials = [{ username: "clyth", password: "Zmt8CBvWPOV%JQJ1"}];
// { username: "cjlyth", password: "Zmt8CBvWPOV%JQJ1"}

var osirisService = new osiris.OsirisService({
		endpoints: endpoints
	, credentials: credentials
});


osirisService.listJobs(function(err, jobList){
	if (err) {
		debug('ERROR - ' + err);	
		return;
	}
	if (_.isArray(jobList)) {
		_.each(jobList, function(v, i){
			debug({'sid': _.result(v, 'sid')});	
		});
	} else {
		debug(_.transform(jobList, function(t, v, k){
			t[k] = _.isArray(v) ? {
				'isArray': _.isArray(v)
				, 'length':v.length
			} : v;
		}));	
	}
});

// var strQuery = 'search index=twitter  author=TeamRedHack OR author=RedHack_EN OR author=TheRedHAck earliest=1 | dedup id   | rename author as author_handle, name as author_name, tweet_created_at as created_date  | table id,created_date,text,author_handle,author_name,author_image';
// async.auto({
//   'endpoint': [function(done){
//   	osirisService.firstEndpoint(done);
//   }],
//   'service':  ['endpoint', function(done, ctx){
//   	done(null, ctx.endpoint.splunkService);
//   }],
//   'username':  ['service', function(done, ctx){
//   	done(null, ctx.service.username);
//   }],
//   'jobs':  ['service', 'username', function(done, ctx){
//   	ctx.service.jobs().fetch({search: ctx.username}, function(err, jobs){
//   		if (err) {
//   			return done(err);
//   		}
// 			if (!jobs || !jobs.list) {
// 				return done(util.format('[%s] unable to list fetched jobs for service: %j', self.id, err));
// 			}
// 			done(null, jobs.list());
//   	});
//   	// ctx.service.search(strQuery, done);
//   }],
// }, function(err, results){
// 	if (err) {
// 		debug({'osirisService.createEndpoints[ERROR]': err});	
// 		return;
// 	}
// 	debug({
// 		keys: _.keys(results)
// 		, username: results.username
// 		, jobs: results.jobs
// 	});
// });






  // 'job': ['endpoint', function(callback){}],

		// var searchArgs = {
		// 	"label": "test"
		// 	// id: "myjob_123"
		// 	//, timeout: 60
		// };

		// endpoint.splunkService.search(strQuery, /*searchArgs,*/ function(err, job){
		// 	// done(err);
			
		// });

  	
  