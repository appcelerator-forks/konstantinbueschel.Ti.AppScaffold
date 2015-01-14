/*
 * RootWindow.js
 *
 * /Resources/ui/windows/android/RootWindow.js
 *
 * This module represents the Android root window
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
 * Creates and returns Android root window
 *
 * @public
 * @method createWindow
 * @param {Map/Dictonary} args
 * @return {Ti.UI.Window} rootWindow
 */
exports.createWindow = function(args) {

	// import the stylesheet
	var Stylesheet = require('/ui/Stylesheet'),
	    styles = new Stylesheet(),
	    stylesheet = styles.init();


	// create window
	var rootWindow = Ti.UI.createWindow(require('/helpers/common/tools').combine(stylesheet.window, stylesheet.rootWindow));


	// add window event listener
	rootWindow.addEventListener('androidback', _onBack);

	rootWindow.addEventListener('close', function(closeEvent) {

		// DEBUG INFO
		Ti.API.debug('[RootWindow] is closed!');


		// remove event listener
		this.removeEventListener('androidback', _onBack);


		// memory management
		rootWindow = null;
		_onBack = null;


		return;

	}); // END close callback()


	/**
	 * On Android hardware back action
	 *
	 * @private
	 * @method _onBack
	 * @param {Object} backEvent
	 * @return void
	 */
	function _onBack(backEvent) {

		require('/helpers/app/EventDispatcher').trigger('app:closeRootWindow');

		return;

	} // END _onBack()


	// memory management
	Stylesheet = null;
	styles = null;
	stylesheet = null;


	return rootWindow;

}; // END createWindow()