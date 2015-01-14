/*
 * ContextMenu.js
 *
 * /Resources/stylesheets/iphone/ContextMenu.js
 *
 * This module provides the context menu styles
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
 * Stylesheet for context menu (iPhone)
 *
 * @constructor
 * @method Stylesheet
 * @return {Stylesheet} this
 */
function Stylesheet() {

	var Tools = require('/helpers/common/tools'),
	    metaBarHeight = (Tools.statusBarHeight + Tools.navigationBarHeight);


	// window
	this.window = {

		top:   (Tools.statusBarHeight + Tools.navigationBarHeight),
		right: 5,

		navBarHidden: true,
		opacity:      0
	};


	// overlay
	this._overlay = {

		width:  Tools.deviceWidth,
		height: (Tools.deviceHeight - metaBarHeight),
		top:    metaBarHeight,

		backgroundColor:  'transparent',
		navBarHidden:     true,
		translucent:      false,

		orientationModes: [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]
	};


	// tableview
	this.menu = {

		width:  Ti.UI.FILL,
		height: Ti.UI.FILL,

		showVerticalScrollIndicator: false,
		allowsSelection:             true,
		scrollable:                  false,

		backgroundColor: 'transparent',

		separatorColor:  '#aeaeae',
		separatorInsets: {
			left:  0,
			right: 0
		}
	};


	// tableview row
	this.menuRow = {

		width:  Ti.UI.FILL,
		height: Ti.UI.SIZE,

		backgroundColor: 'transparent',
		backgroundImage: 'transparent',

		className: 'contextMenuRow',

		selectedBackgroundColor: '#4ead54',
		selectedColor:           '#ffffff',
		color:                   '#040404',

		indentionLevel: 2.5,

		font: {
			fontSize: 16
		}
	};


	// return all these objects
	return this;

} // END Stylesheet()


// provide public access to module
module.exports = Stylesheet;
