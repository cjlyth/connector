process.env.TB_OSIRIS_HOST = 'osiris-ash-search-04.osiris.blu.csn.internal';
process.env.TB_OSIRIS_PORT = '8089';
process.env.TB_OSIRIS_TIMEOUT = '4000';
process.env.TB_OSIRIS_PATH = '/services/search/jobs';

process.env.TB_OSIRIS_USERNAME = 'user_test';
process.env.TB_OSIRIS_PASSWORD = 'changeme';

var util = require('util');
var chalk = require('chalk');

_ = require('lodash');
debug = require('debug');
sinon = require('sinon');

var quote = chalk.dim('"')
		  , comma = chalk.dim(',')
		  , coln = chalk.dim(': ')
		  , sLBr = chalk.dim('{')
		  , sRBr = chalk.dim('}')
		  , sqLBr = chalk.dim('[')
		  , sqRBr = chalk.dim(']')
		  , hidden = /^_/
		  , strJoin = '\n\t  ' + comma;

function StyleInfo(value, key) {
	this.label = { original: key };
	this.value = { original: value };
}
StyleInfo.prototype.toLine = function(){
	var styleInfo = this;
	return _(styleInfo.label)
						 .pick('padding', 'colored')
						 .values()
 .concat([coln], 
			 	_(styleInfo.value)
			 				.pick('colored')
			 				.values())
 .join('');	
}
function printVal(styleInfo) {
	var v = styleInfo.value.original;
			// :_.isFinite(v)
		// ? '[Finite]'

	styleInfo.value.type = 
	_.isUndefined(v)
		? 'undefined'
		:_.isNumber(v)
		? '[Number]'
		:_.isArray(v)
		? '[Array]'
		:_.isBoolean(v)
		? '[Boolean]'
		:_.isDate(v)
		? '[Date]'
		:_.isElement(v)
		? '[Element]'
		:_.isFunction(v)
		? '[Function]'
		:_.isNaN(v)
		? '[NaN]'
		:_.isNull(v)
		? '[Null]'
		:_.isObject(v)
		? '[Object]'
		:_.isPlainObject(v)
		? '[PlainObject]'
		:_.isRegExp(v)
		? '[RegExp]'
		:_.isString(v)
		? '[String]'
		: 'uhhhh?';

	return styleInfo;
}

var defaultValueStyle = function(styleInfo){
			styleInfo.value.colored = chalk.yellow(styleInfo.value.type);
		}
  , typeValueStyle = function(styleInfo){
			styleInfo.value.colored = chalk.red(styleInfo.value.type);
		}
	, arrayValueStyle = function(styleInfo){
		// 
		console.log(styleInfo.value.original);
		// 
			styleInfo.value.colored = 
			util.format(chalk.yellow('%s') + chalk.yellow.dim(' (length: %d)')
								 ,styleInfo.value.type
								 ,styleInfo.value.original.length)
	}
	, numValueStyle = function(styleInfo){
			styleInfo.value.colored = chalk.cyan(styleInfo.value.original);
	}
	, boolValueStyle = function(styleInfo){
			styleInfo.value.colored = (styleInfo.value.original 
				? chalk.magenta 
				: chalk.magenta.dim)(styleInfo.value.original);
	}
	, grayValueStyle = function(styleInfo){
			styleInfo.value.colored = chalk.gray(styleInfo.value.type);
	}
	, stringValueStyle = function(styleInfo){
		var padInfo = labelPadding({
			label: { original: styleInfo.value.original }
		}, 50);
		styleInfo.value.colored = quote + chalk.green.dim(padInfo.label.trimmed) + quote;
	};
var valTypeStyleMap = {
  'undefined'			: grayValueStyle
, '[Array]'				: arrayValueStyle
, '[Boolean]'			: boolValueStyle
, '[Date]'				: defaultValueStyle
, '[Element]'			: defaultValueStyle
, '[Empty]'				: defaultValueStyle
, '[Equal]'				: defaultValueStyle
, '[Finite]'			: defaultValueStyle
, '[Function]'		: typeValueStyle
, '[NaN]'					: defaultValueStyle
, '[Null]'				: defaultValueStyle
, '[Number]'			: numValueStyle
, '[Object]'			: defaultValueStyle
, '[PlainObject]'	: defaultValueStyle
, '[RegExp]'			: defaultValueStyle
, '[String]'			: stringValueStyle
};

function styleVals(styleInfo) {
	valTypeStyleMap[styleInfo.value.type](styleInfo);
	return styleInfo;
}
function styleKeys(prot, publ) {
	if (!prot) {
		prot = chalk.stripColor;	
	}
	if (!publ) {
		publ = chalk.stripColor;	
	}
	return function(styleInfo) {
		styleInfo.label.colored = (hidden.test(styleInfo.label.original) 
													? prot 
													: publ)(styleInfo.label.trimmed);
		return styleInfo;
	};
}		  
function quoteString(str) {
	return quote + str + quote;
}

function labelPadding(styleInfo, max, pad){
	var ctx = {};
	ctx.pad = pad || ' ';
	ctx.max = Math.ceil(_.isNumber(max) ? max : 50);

	var lbl = styleInfo.label.original;

	styleInfo.label.trimmed = (lbl.length > ctx.max) 
							? lbl.slice(0, ctx.max - lbl.length  - 1) + '~'
							: lbl; 
	styleInfo.label.padding = _.chain(styleInfo.label.trimmed)
							.size()
							.range(ctx.max)
							.map(_.constant(ctx.pad))
							.join('')
							.value();

	return styleInfo;
}
var fnKeyStyle = styleKeys(chalk.cyan, chalk.blue);
var reg = /^|\n/g
  , inspect = function (v) {
  	if (_.isString(v)) {
  		return v;
  	}
  	if (_.isArray(v)) {
  		return sqLBr + _.map(v, inspect).join(comma + ' ') + sqRBr;
  	}

		var all = _.keys(v).sort()
			,	fns = _.functions(v).sort()
		  , kys = _.difference(all, fns)
		  , maxWidth = _(all).map(_.size).max().value();
		
		var keyPaddingInfo = _.partialRight(labelPadding, maxWidth)
		  , valPaddingInfo = _.partialRight(labelPadding, 30);

		var labelStyles = _.compose(fnKeyStyle, keyPaddingInfo)
		  , valueStyles = _.compose(styleVals, valPaddingInfo, printVal);

		var txt = '';


		if (!_.isEmpty(kys)) {
			txt += _(v).pick(kys)
			.map(function(value, key){
				return new StyleInfo(value, key);
			})
			.each(_.createCallback(labelStyles, null, 1))
			.each(_.createCallback(valueStyles, null, 1))
			.invoke('toLine')
			.join('\n');			
		}
		if (!_.isEmpty(fns)) {
			// txt += chalk.gray.dim("\nfunctions: \n");
			txt += '\n';
			txt += _(v).pick(fns)
			.map(function(value, key){
				return new StyleInfo(value, key);
			})
			.each(_.createCallback(labelStyles, null, 1))
			.each(_.createCallback(valueStyles, null, 1))
			.invoke('toLine')
			.join('\n');
		}
		return sLBr + '\n' + txt + '\n' + sRBr;
	};

debug.formatters.o = function(v) {
	return util.format('%s', inspect(v));
};
