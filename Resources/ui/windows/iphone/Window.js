/*
 * Window.js
 * 
 * /Resources/ui/windows/iphone/Window.js
 * 
 * This module represents the default app window
 * 
 * Author:		kbueschel
 * Date:		2014-09-08
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
	var _window =				Ti.UI.createWindow(Tools.combine(_stylesheet.window, args)),
		
		_leftNavBarButton =		Ti.UI.createButton(_stylesheet.menuButton),
		_rightNavBarButton =	Ti.UI.createButton(_stylesheet.contextMenuButton);
	
	
	/**
	 * Left navbar button click callback - 
	 * toggles menu visibilty 
	 * 
	 * @private
	 * @method _onLeftNavBarButtonClick 
 	 * @param {Object} event
 	 * @return void
	 */
	function _onLeftNavBarButtonClick(event) {
		
		// fire event to close context menu
		Ti.App.fireEvent('app:closeContextMenu');
		
		
		// toggle menu visibility
		var actions = require('/helpers/common/globals').global.action;
		
		Tools.navigateApp({
			action:	actions.TOGGLE_MENU
		});
		
		return;
		
	} // END _onLeftNavBarButtonClick()
	
	_leftNavBarButton.addEventListener('click', _onLeftNavBarButtonClick);
	
	
	// add left navbar button to window
	_window.setLeftNavButton(_leftNavBarButton);
	
	
	/**
	 * Right navbar button click callback - 
	 * shows up context menu
	 * 
	 * @private
	 * @method _onRightNavBarButtonClick
 	 * @param {Object} event
 	 * @return void
	 */
	function _onRightNavBarButtonClick(event) {
		
		var actions = require('/helpers/common/globals').global.action;
		
		Tools.navigateApp({
			action:	actions.TOGGLE_APP_OVERFLOW_MENU
		});
		
		return;
		
	} // END _onRightNavBarButtonClick()
	
	_rightNavBarButton.addEventListener('click', _onRightNavBarButtonClick);
	
	
	// add right navbar button to window
	_window.setRightNavButton(_rightNavBarButton);
	
	
	// add window click listener to close context menu
	_window.addEventListener('click', _onWindowClick);
	
	
	/**
	 * Window click callback
	 * 
	 * @private
	 * @method _onWindowClick
 	 * @param {Object} clickEvent
 	 * @return void
	 */
	function _onWindowClick(clickEvent) {
		
		// fire event to close context menu
		Ti.App.fireEvent('app:closeContextMenu');
		
		return;
		
	} // END _onWindowClick()
	
	
	return _window;
	
} // END Window()


// provide public access to module
module.exports = Window;
