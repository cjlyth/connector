// exports = module.exports = require('./lib/osiris');
'use strict';

var util = require('util')
  , osiris = require('./lib/osiris');

var osirisService = new osiris.OsirisService({
		endpoints: [
			'osiris-ash-search-01.osiris.blu.csn.internal'
		, 'osiris-ash-search-02.osiris.blu.csn.internal'
		, 'osiris-ash-search-03.osiris.blu.csn.internal'
		, 'osiris-ash-search-04.osiris.blu.csn.internal']
	, credentials: [
			{ username: "clyth", password: "Zmt8CBvWPOV%JQJ1"}
		, { username: "user_test", password: "changeme"}]
});
osirisService.createServers(function(err, osirisEndpoints){
	console.log(util.inspect(osirisService, { showHidden: false, depth: null, colors: true }));		
});
