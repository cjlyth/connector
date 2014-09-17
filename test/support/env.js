// process.env.NODE_ENV = 'test';
process.env.DEBUG = 'osiris OsirisEndpoint OsirisService';

process.env.TB_OSIRIS_HOST = 'osiris-ash-search-04.osiris.blu.csn.internal';
process.env.TB_OSIRIS_PORT = '8089';
process.env.TB_OSIRIS_TIMEOUT = '4000';
process.env.TB_OSIRIS_PATH = '/services/search/jobs';

process.env.TB_OSIRIS_USERNAME = 'user_test';
process.env.TB_OSIRIS_PASSWORD = 'changeme';

debug = require('debug');
var util = require('util');
var reg = /^|\n/g
  , inspect = function (v, colors) {
		return util.inspect(v, { 
			showHidden: false, 
			depth: null, 
			colors: true,
			customInspect: false
		});
	};
debug.formatters.o = function(v) {
  return inspect(v, this.useColors)
    .replace(reg, '\n\t');
};
