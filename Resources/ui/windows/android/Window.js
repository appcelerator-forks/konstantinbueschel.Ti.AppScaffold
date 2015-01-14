/*
 * Window.js
 *
 * /Resources/ui/windows/android/Window.js
 *
 * This module represents the default app window
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
 * Window
 *
 * @constructor
 * @param {Map/Dictonary} args
 * @return {Ti.UI.Window} viewProxy
 */
function Window(args) {

	// import the stylesheet
    var Stylesheet =	require('/ui/Stylesheet'),
		Tools =			require('/helpers/common/tools'),

		_styles =		new Stylesheet(),
		_stylesheet =	_styles.init();


	// create default window elements
	var _window = Ti.UI.createWindow(Tools.combine(_stylesheet.window, args));


	// setup Android actionbar
	var Menu = require('/helpers/app/menu'),
	    androidMenu = new Menu(_window);


	// app context menu
	require('/helpers/common/globals').menu.APP_CONTEXT_MENU_DATA.forEach(function(contextMenuItemData) {

		var options = contextMenuItemData.options;

		androidMenu.add({

			title:   options.title,
			itemId:  options.itemId,
			groupId: options.groupId,

			showAsAction: Ti.Android.SHOW_AS_ACTION_NEVER,
			onClick:      _handleContextMenuSelection
		});

		options = null;

		return;

	}, this);


	// GC
	Stylesheet = null;
	Tools = null;
	_styles = null;
	_stylesheet = null;


	/**
	 * Android actionbar overflow menu alias app
	 * context menu item click callback - Delegates
	 * opening of app views depend on event.appAction
	 * property
	 *
	 * @private
	 * @method _handleContextMenuSelection
	 * @param {Object} selectionEvent
	 * @return void
	 */
	function _handleContextMenuSelection(selectionEvent) {

		require('/helpers/common/tools').navigateApp({

			action: require('/helpers/common/globals').action.CONTEXT_MENU_SELECTION,
			source: this,
			data:   selectionEvent
		});

		return;

	} // END _handleContextMenuSelection()


	return _window;

} // END Window()


// provide public access to module
module.exports = Window;
