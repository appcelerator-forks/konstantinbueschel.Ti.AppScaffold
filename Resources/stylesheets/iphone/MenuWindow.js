/*
 * ERF Pop
 * 
 * MenuWindow.js
 * 
 * /Resources/stylesheets/iphone/MenuWindow.js
 * 
 * This module provides the menu window styles
 * 
 * Author:		kbueschel
 * Date:		2014-08-01
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
	
	var Tools =		require('/helpers/common/tools'),
		action =	require('/helpers/common/globals').global.action;


	// menu data
	this.menuItems = [

		// section 1
        {
			type:		'ITEM',
			options:	{
				title:	L('menuItemTitleOnAir'),
				action:	action.ON_AIR_SCREEN
			}
        },
        {
			type:		'ITEM',
			options:	{
				title:	L('menuItemTitleMediaLibrary'),
				action:	action.MEDIA_LIBRARY_SCREEN
			}
        },
        {
			type:		'ITEM',
			options:	{
				title:	L('menuItemTitleSocial'),
				action:	action.SOCIAL_SCREEN
			}
        },
        {
			type:		'ITEM',
			options:	{
				title:	L('menuItemTitlePlaylist'),
				action:	action.PLAYLIST_SCREEN
			}
        },
        {
			type:		'ITEM',
			options:	{
				title:	L('menuItemTitleBackstage'),
				action:	action.BACKSTAGE_SCREEN
			}
        },
        {
			type:		'ITEM',
			options:	{
				title:	L('menuItemTitleSpecial'),
				action:	action.SPECIAL_SCREEN
			}
        },
        {
			type:		'ITEM',
			options:	{
				title:	L('menuItemTitleDonate'),
				action:	action.DONATE_SCREEN
			}
        },
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
		
		heigth:				Ti.UI.FILL,
		
		barColor:			'#9a9a9a',
		translucent:		false,
		fullscreen:			true,
		
		backgroundColor:	'#9a9a9a'
	};
	
	
	// tableview
	this.menuView = {
		
		height:							Ti.UI.SIZE,
		top:							45,
		
		backgroundColor:				'transparent',
		showVerticalScrollIndicator:	false,
		scrollable:						false,
		
		separatorColor:					'#7b7b7b',
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
		
		options:						{}
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
		right:				27,
		
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
