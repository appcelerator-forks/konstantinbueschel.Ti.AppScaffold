/*
 * APPNAME
 * 
 * ContextMenu.js
 * 
 * /Resources/stylesheets/iphone/ContextMenu.js
 * 
 * This module provides the context menu styles
 * 
 * Author:		kbueschel
 * Date:		2014-XX-XX
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
	
	var Tools =		require('/helpers/common/tools'),
		action =	require('/helpers/common/globals').global.action;


	// window
	this.window = {
		
		top:				(Tools.statusBarHeight + Tools.navigationBarHeight),
        right:				5,
        
        navBarHidden:		true,
		opacity:			0
	};
	
	
	// tableview
	this.menu = {
		
		width:							Ti.UI.FILL,
		height:							Ti.UI.FILL,
		
		showVerticalScrollIndicator:	false,
		allowsSelection:				true,
		scrollable:						false,
		
		backgroundColor:				'transparent',
		
		separatorColor:					'#aeaeae',
		separatorInsets:				{
			left:	0,
			right:	0
		}
	};

	
	// tableview row
	this.menuRow = {
		
		width:							Ti.UI.FILL,
		height:							Ti.UI.SIZE,
		
		layout:							'vertical',
		
		backgroundColor:				'transparent',
		backgroundImage:				'transparent',
		
		className:						'menuRow',
		
		selectedBackgroundColor:		'#4ead54',
		selectedColor:					'#ffffff',
		
		options:						{},
	};
	
	
	this.menuRowContentContainer = {
		
		width:				Ti.UI.FILL,
		height:				Ti.UI.SIZE,
		
		layout:				'vertical',
		backgroundColor:	'transparent',
		
		zIndex:				0,
		touchEnabled:		false
	};
	

	this.menuRowTitle = {
		
		width:				Ti.UI.SIZE,
		height:				44,
				
		left:				27,
		
		backgroundColor:	'transparent',
		color:				'#040404',
		
		font:	{
			fontSize:	16
		},
		
		touchEnabled:		false
	};
	

	// return all these objects
	return this;

} // END Stylesheet()


// provide public access to module
module.exports = Stylesheet;
