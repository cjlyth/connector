should = require('should')
sinon = require('sinon')


function print(o){

	console.log(util.inspect(o, { showHidden: false, depth: null, colors: true }));
	console.log('~~');
}