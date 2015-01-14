/*
 * MenuWindow.js
 *
 * /Resources/stylesheets/iphone/MenuWindow.js
 *
 * This module provides the menu window styles
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
 * Stylesheet for menu window (iPhone)
 *
 * @constructor
 * @method Stylesheet
 * @return {Stylesheet} this
 */
function Stylesheet() {

	var action = require('/helpers/common/globals').action;


	// menu data
	this.menuItems = [

		// section 1
        {
			type:		'ITEM',
			options:	{
				title:	L('menuItemTitleContact'),
				action:	action.CONTACT_SCREEN
			}
        }
	];


	// window
	this.window = {

		heigth: Ti.UI.FILL,

		barColor:    '#9a9a9a',
		translucent: false,
		fullscreen:  true,

		backgroundColor: '#9a9a9a'
	};


	// tableview
	this.menuView = {

		height: Ti.UI.SIZE,
		top:    45,

		backgroundColor:             'transparent',
		showVerticalScrollIndicator: false,
		scrollable:                  false,

		separatorColor:  '#7b7b7b',
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

		className: 'menuRow',

		selectedBackgroundColor: '#4ead54',
		selectedColor:           '#ffffff',

		indentionLevel: 2.5,
		color:          '#040404',

		font: {
			fontSize: 16
		}
	};


	// return all these objects
	return this;

} // END Stylesheet()


// provide public access to module
module.exports = Stylesheet;
