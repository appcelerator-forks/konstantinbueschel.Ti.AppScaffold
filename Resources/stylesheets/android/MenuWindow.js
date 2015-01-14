/*
 * MenuWindow.js
 *
 * /Resources/stylesheets/android/MenuWindow.js
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


	// tableview
	this.menuView = {

		height:       Ti.UI.SIZE,
		rowHeight:    48,
		minRowHeight: 48,

		backgroundColor: '#9a9a9a',

		showVerticalScrollIndicator: false,
		scrollable:                  false,

		separatorColor: '#7b7b7b'
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

		color: '#040404',

		font: {
			fontSize: 16
		}
	};

	this.menuRowContainer = {

		width: Ti.UI.FILL,
		height: Ti.UI.FILL,

		backgroundColor: 'transparent',
		touchEnabled: false
	};

	this.menuRowTitle = {

		width: Ti.UI.FILL,
		height: Ti.UI.SIZE,

		left: 15,

		color:  '#040404',
		font: {
			fontSize:   16
		},

		touchEnabled: false
	};
	// return all these objects


	return this;

} // END Stylesheet()


// provide public access to module
module.exports = Stylesheet;
