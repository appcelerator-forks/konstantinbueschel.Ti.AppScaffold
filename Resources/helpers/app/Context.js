/*
 * Context.js
 *
 * /Resources/helpers/app/Context.js
 *
 * This module fires ti.app.resume / pause / exit events on Android
 *
 * Author:		kbueschel
 * Date:		2015-01-09
 *
 * Maintenance Log
 *
 * Author:
 * Date:
 * Changes:
 *
 * Copyright (c) 2014 by die.interaktiven GmbH & Co. KG. All Rights Reserved.
 * Proprietary and Confidential - This source code is not for redistribution
 */

var _activeActivity,
    _activitycount = 0;


/**
 * Generates activity "name" / window context ID
 *
 * @private
 * @method generate_name
 * @return {String}
 */
function generate_name() {

	_activitycount++;

	return ("activity-" + _activitycount);

} // END generate_name()


/**
 * Window open callback
 *
 * @private
 * @method on_open
 * @param {Ti.UI.Window} w
 * @return void
 */
function on_open(w) {

	var name = w.context_id,
		activity = w.activity;


	activity.onStart = function () {

		if (_activeActivity == name) {
			Ti.App.fireEvent('resumed');
		}

		_activeActivity = name;

		return;
	};


	activity.onStop = function () {

		if (_activeActivity == name) {
			Ti.App.fireEvent('paused');
		}

		return;
	};


	activity.onPause = function() {

		if (_activeActivity == name) {

			Ti.App.fireEvent('pause');
		}

		return;
	};


	activity.onResume = function() {

		if (_activeActivity == name) {

			Ti.App.fireEvent('resume');
		}

		return;
	};


	activity.onDestroy = function() {

		if (_activeActivity == name) {

			Ti.App.fireEvent('destroy');
		}

		return;
	};


	return;

} // END on_open()


/**
 * Window close callback
 *
 * @private
 * @method on_close
 * @param {Ti.UI.Window} w
 * @return void
 */
function on_close(w) {

	var activity = w.activity;

	activity.onStart = null;
	activity.onStop = null;
	activity.onResume = null;
	activity.onPause = null;
	activity.onDestroy = null;

	return;

} // END on_close()


/**
 * Context Class
 *
 * @public
 * @constructor
 * @return {Context} this
 */
function Context() {

	return this;

} // END Context


/**
 * Tracks pause, resume, paused and resumed events for given window
 *
 * @public
 * @method track
 * @param {Ti.UI.Window} win
 * @return void
 */
Context.track = function (win) {

	win.context_id = generate_name();

	win.addEventListener('open', function (e) {
		on_open(win);
	});

	win.addEventListener('close', function (e) {
		on_close(win);
	});

	return;

}; // END track()


// provide public access
module.exports = Context;
