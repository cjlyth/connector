'use strict';


process.env.DEBUG = "osiris"; //,OsirisEndpoint,OsirisService
require('./test/support/env');

var _ = require('lodash')
  , async = require('async')
  , osiris = require('./lib/osiris')
  , debug = require('debug')('osiris');

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

osirisService.firstEndpoint(function(err, endpoint){
	if (err) {
		return debug('Error getting endpoint: ',err);
	}
	doSearch(endpoint.splunkService);
	//debug('splunkService: %o',endpoint.splunkService);

});
function doSearch(service){
	var searchQuery = "search index=twitter  author=TeamRedHack OR author=RedHack_EN OR author=TheRedHAck earliest=1 | dedup id   | rename author as author_handle, name as author_name, tweet_created_at as created_date ";
	var searchParams = {
	  exec_mode: "normal",
	  earliest_time: "2012-06-20T16:27:43.000-07:00"
	};

	service.search(
	  searchQuery,
	  searchParams,
	  function(err, job) {

	    // Display the job's search ID
	    console.log("Job SID: ", job.sid);

	    // Poll the status of the search job
	    job.track({period: 500}, {
	    	ready: function(job){
	    		console.log("ready!");
	    	},
	    	progress: function(job){
	    		var p = _.pick(job.properties(), [ 
	    			'doneProgress'
	    		, 'eventAvailableCount'
	    		, 'eventCount'
	    		, 'isDone'
	    		, 'isFailed'
	    		, 'isFinalized'
	    		, 'isZombie'
	    		, 'resultCount'
	    		, 'runDuration'
	    		, 'scanCount'
	    		, 'sid'
	    		, 'search'
	    		, 'ttl']);
	    		process.stdout.write("\u001b[2J\u001b[0;0H");
	    		debug('progress: %o', p);
	    		// console.log("progress!", job);
	    	},
	      done: function(job) {
	        console.log("Done!");

	        // Print out the statics
	        console.log("Job statistics:");
	        console.log("  Event count:  " + job.properties().eventCount); 
	        console.log("  Result count: " + job.properties().resultCount);
	        console.log("  Disk usage:   " + job.properties().diskUsage + " bytes");
	        console.log("  Priority:     " + job.properties().priority);

	        // Get the results and print them
	        // job.results({}, function(err, results, job) {
	        //   var fields = results.fields;
	        //   var rows = results.rows;
	        //   for(var i = 0; i < rows.length; i++) {
	        //     var values = rows[i];
	        //     console.log("Row " + i + ": ");
	        //     for(var j = 0; j < values.length; j++) {
	        //       var field = fields[j];
	        //       var value = values[j];
	        //       console.log("  " + field + ": " + value);
	        //     }
	        //   }
	        // });
	        
	      },
	      failed: function(job) {
	        console.log("Job failed")
	      },
	      error: function(err) {
	        done(err);
	      }
	    });

	  }
	);	
}
