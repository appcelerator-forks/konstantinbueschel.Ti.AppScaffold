/*
 * SettingsWindow.js
 *
 * /Resources/ui/windows/iphone/SettingsWindow.js
 *
 * This module represents the app's settings window
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

/**
 * Creates and returns settings window
 *
 * @public
 * @method createWindow
 * @param {Map/Dictonary} args
 * @return {Ti.UI.Window} settingsWindow
 */
exports.createWindow = function(args) {

	// import the stylesheet
    var Stylesheet =	require('/ui/Stylesheet'),
		Tools =			require('/helpers/common/tools'),

		styles =		new Stylesheet(),
		stylesheet =	styles.init();


	// merge options
	var options = Tools.combine(stylesheet.settingsWindow, (args || {}));

	options = Tools.combine(stylesheet.window, options);


	// create right navbar buttons
	var closeButton = Ti.UI.createButton(stylesheet.closeButton);



	/**
	 * Closes the parent window
	 *
	 * @private
	 * @method _close
	 * @return void
	 */
	var _close = function() {

		// fire on air view update playback state
		require('/helpers/app/EventDispatcher').trigger('app:checkPlaybackState');


		// fire analytics event
		require('/helpers/analytics/ga').event(L('analyticsEventCategoryInAppSettings'), L('analyticsEventActionButtonPress'), L('analyticsEventActionClose'));


		// close window
		if (settingsWindow.navigationWindow) {

			settingsWindow.navigationWindow.close();
		}
		else {

			settingsWindow.close();
		}

		return;

	}; // END _close()


	// add event listener
	closeButton.addEventListener('click', _close);

	options.rightNavButton = closeButton;


	// create window
	var settingsWindow = Ti.UI.createWindow(options);


	// add window event listener
	settingsWindow.addEventListener('close', function() {

		// remove views
		settingsView.destroy();
		settingsWindow.remove(settingsView.viewProxy);


		// release vars for GC
		closeButton = null;
		_close = null;
		settingsWindow = null;
		settingsView = null;

		return;
	});


	// create settings view
	var settingsView = require('/ui/common/iphone/SettingsView').createView(options);


	// add view to window
	settingsWindow.add(settingsView.viewProxy);


	// release vars
	Stylesheet = null;
	styles = null;
	stylesheet = null;


	return settingsWindow;

}; // END createWindow()