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
		})
  , jobFieldSelector = _.partialRight(_.pick, ['sid', 'properties'])
	, jobProperties = _(_.result).partialRight('properties')
												 .createCallback(null, 1)
												 .value();
debug('Fetching job list');	
osirisService.listJobs(function(err, jobList){
	if (err) {
		debug('ERROR - %s', err);	
		return;
	}
	var jobs = _.chain(jobList)
		.map(jobFieldSelector)
		.tap(function printJobList(list){
			debug('jobList[%d]> %o', list.length, list);
		})
		.indexBy('sid')
		.mapValues(jobProperties)
		.value();
});
var strQuery = 'search index=twitter  author=TeamRedHack OR author=RedHack_EN OR author=TheRedHAck earliest=1 | dedup id   | rename author as author_handle, name as author_name, tweet_created_at as created_date  | table id,created_date,text,author_handle,author_name,author_image';
