/*
 * ga.js
 *
 * /Resources/helpers/analytics/ga.js
 *
 * This module is a helper for GoogleAnalytics App Tracking
 *
 * - Main module with the native SDKs is this one: https://github.com/benbahrenburg/Ti.GA
 *
 * Author:  kbueschel
 * Date:    2015-01-09
 *
 * Maintenance Log
 *
 * Author:
 * Date:
 * Changes:
 *
 */

// private stateful variables
var GoogleAnalytics, tracker, Fields, MapBuilder;


// public variables
exports.id = null;


/**
 * Sends screen view to Google Analytics
 *
 * @public
 * @method screen
 * @param {String} name
 * @return {*}
 */
exports.screen = function screen(name) {

	return init().send(MapBuilder.createAppView().set(Fields.SCREEN_NAME, name).build());

}; // END screen()


/**
 * Sends event to Google Analytics
 *
 * @public
 * @method event
 * @param {String} category
 * @param {String} action
 * @param {String} label
 * @param {Number} value
 * @return {*}
 */
exports.event = function event(category, action, label, value) {

	if (typeof category === 'object') {
		var args = category;
		category = args.category;
		action = args.action;
		label = args.label;
		value = args.value;
	}


	if (typeof value === 'number') {

		return init().send(MapBuilder.createEvent(category, action, label, value).build());
	}
	else {

		return init().send(MapBuilder.createEvent(category, action, label).build());
	}

}; // END event()


/**
 * Sends social action to Google Analytics
 *
 * @public
 * @method social
 * @param {String} network
 * @param {String} action
 * @param {String} target
 * @return {*}
 */
exports.social = function social(network, action, target) {

	if (typeof network === 'object') {
		var args = network;
		network = args.network;
		action = args.action;
		target = args.target;
	}

	return init().send(MapBuilder.createSocial(network, action, target).build());

}; // END social()


/**
 * Sends a timing to Google Analytics
 *
 * @public
 * @method timing
 * @param {String} category
 * @param {Long/Number} intervalInMilliseconds
 * @param {String} name
 * @param {String} label
 * @return {*}
 */
exports.timing = function timing(category, intervalInMilliseconds, name, label) {

	if (typeof category === 'object') {

		var args = category;
		category = args.category;
		intervalInMilliseconds = args.intervalInMilliseconds || args.interval;
		name = args.name;
		label = args.label;
	}

	return init().send(MapBuilder.createTiming(category, intervalInMilliseconds, name, label).build());

}; // END timing()


/**
 * Sends a transaction to Google Analytics
 *
 * @public
 * @method transaction
 * @param {String} transactionId
 * @param {String} affiliation
 * @param {Double/Number} revenue
 * @param {Double/Number} tax
 * @param {Double/Number} shipping
 * @param {String} currencyCode
 * @return {*}
 */
exports.transaction = function transaction(transactionId, affiliation, revenue, tax, shipping, currencyCode) {

	if (typeof transactionId === 'object') {
		var args = transactionId;
		transactionId = args.transactionId || args.id;
		affiliation = args.affiliation;
		revenue = args.revenue;
		tax = args.tax;
		shipping = args.shipping;
		currencyCode = args.currencyCode || args.currency;
	}

	return init().send(MapBuilder.createTransaction(transactionId, affiliation, revenue, tax, shipping, currencyCode).build());

}; // END transaction()


/**
 * Returns a tracker for Google Analytics tracking
 *
 * @public
 * @method tracker
 * @return {*}
 */
exports.tracker = function tracker() {

	return init();

}; // END tracker()


/**
 * Returns Google Analytics module proxy object
 *
 * @public
 * @method proxy
 * @return {ti.googleanalytics}
 */
exports.proxy = function proxy() {

	init();

	return GoogleAnalytics;

}; // END proxy()


/**
 * Sets the log level for the Google Analytics logger
 *
 * @public
 * @method setLogLevel
 * @param {String} mode
 * @return {*}
 */
exports.setLogLevel = function logLevel(mode) {

	init();

	return GoogleAnalytics.setLogLevel(GoogleAnalytics['LOG_' + (mode || 'ERROR').toUpperCase()]);

}; // END setLogLevel()


/**
 * dryRun setter
 *
 * @public
 * @method setDryRun
 * @param {Boolean} dryRun
 * @return {*}
 */
exports.setDryRun = function setDryRun(dryRun) {

	init();

	return GoogleAnalytics.setDryRun(!!dryRun);

}; // END setDryRun()


/**
 * Sets the opt out options for the Google Analytics module
 *
 * @public
 * @method setOptOut
 * @param {Boolean} optOut
 * @return {*}
 */
exports.setOptOut = function setOptOut(optOut) {

	init();

	return GoogleAnalytics.setOptOut(!!optOut);

}; // END setOptOut()


/**
 * Inits all needed objects to start Google Analytics tracking
 *
 * @public
 * @method init
 * @return {*}
 */
function init() {

	if (!GoogleAnalytics) {

		GoogleAnalytics = require('ti.googleanalytics');

		GoogleAnalytics.setLogLevel(GoogleAnalytics.LOG_ERROR);

		tracker = GoogleAnalytics.getTracker(exports.id);
		Fields = GoogleAnalytics.getFields();
		MapBuilder = GoogleAnalytics.getMapBuilder();
	}

	return tracker;

} // END init()

exports.init = init;
