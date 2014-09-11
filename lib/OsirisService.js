var _ = require('lodash');

exports = module.exports = OsirisService;

function OsirisService (options) {
  var self = this;
  var opts = {
  	endpoints: []	
  };
  _.merge(opts, options, function(optsVal, optionsVal) {
	  return _.isArray(optsVal) ? optsVal.concat(optionsVal) : undefined;
	});
	this.options = opts;
};

