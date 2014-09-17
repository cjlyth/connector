'use strict';
(function AsyncBuilder(){
	exports = module.exports = AsyncBuilder;

	var _ = require('lodash')
	  , async = require('async');

	function AsyncBuilder(tasks){
		_.assign(this.tasks, tasks);
	}

	function extendAsyncBuilder(s, o){
		s.with.apply(s, o);
	}
	AsyncBuilder.prototype = {
		tasks: {},
		result: function(done){
			if (!_.isFunction(done)) {
				throw "Unable to get result without callback!";
			}

			// var done = _.createCallback(_.last(arguments), this, 2);
			var strKeys = _.chain(arguments)
											.rest()
											.filter(_.isString)
											.reject(_.isEmpty)
											.value();

			if (_.isEmpty(strKeys)) {
				return done('Unable to get result for undefined key');
			}

			extendAsyncBuilder(this, strKeys);
			this.auto(function(e,r){
				if (e){ return done(e); }

				// todo: createCallback 
				if (strKeys.length === 1) {
					return done(null, _.result(r, strKeys[0]));
				}
				done(null, _.pick(r, strKeys));
			});
		},
		auto: function(done){
			var self = this;
			// done = _.createCallback(done, self, 2);
			async.auto(self, done);
			// return self;
		},
		with: function() {
			return _(arguments).toArray()
			 .filter(_.isString)
			 .reject(_.isEmpty)
			 .transform(function(s, v){
			 	if (!_.has(s, v) && _.has(s.tasks, v)) {
			 		var setter = _.wrap(s, _.defaults)
			 		  , extendSelf = _.wrap(s, extendAsyncBuilder);

			 		_.chain(s.tasks)
			 			.pick(v)
			 			.tap(setter)
			 			.values()
			 			.map(_.initial)
			 			.each(extendSelf);
			 	}
			 }, this)
			 .value();
		}
	}
})();
