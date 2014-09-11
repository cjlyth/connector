var _ = require('lodash');

exports = module.exports = OsirisEndpoint;

function OsirisEndpoint (options) {
  var opts = _.assign({}, options);
  if (!_.isString(opts.host) 
  	|| _.isEmpty(opts.host)){
  	opts.host = null;
  }
  this.options = opts;
};

OsirisEndpoint.prototype.createServer = function (options) {
  // return new protocols[name](req);
};
