'use strict';
var _ = require('lodash');

exports = module.exports = OsirisEndpoint;

var commonOptions = { 
	 scheme  : "https"
 , port    : "8089"
 , version : "default"};

function OsirisEndpoint (options) {
  var opts = _.assign({}, options);
  if (!_.isString(opts.host) 
  	|| _.isEmpty(opts.host)){
  	opts.host = null;
  }
  this.options = opts;
  
};




function trySplunkLogin(service, callback){
	if (!service) {
		return callback(false);
	}
	service.login(function(err, loggedIn){
		callback(!err && loggedIn);
	});
}

// OsirisEndpoint.prototype.createServer = function (options) {
//   // return new protocols[name](req);
// };
