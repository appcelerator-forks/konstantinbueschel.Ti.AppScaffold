/*
 * iphone.js
 * 
 * /Resources/stylesheets/common/iphone.js
 * 
 * This module provides the common iPhone styles
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
 * iPhone specific common stylesheet module
 * 
 * @contructor
 * @method Stylesheet
 * @return {Stylesheet} this
 */
function Stylesheet() {

	// load requirements
	var Tools = require('/helpers/common/tools');
	
	
	/* ---------------------------------------
	 * common styles
	 * --------------------------------------- */
	
	// colors
	this.titleColor =	'#0c4079';
	this.textColor =	'#606066';
	
	this.imageView = {
		
		preventDefaultImage:	true,
		backgroundColor:		'#a9a9ad'
	};
	
	this.tableView = {
		separatorColor: '#c8c7cc'
	};

	
	// windows
    this.window = {

		backgroundColor:	'#e6e6eb',
		barColor:			'#003773',
		
		titleAttributes:	{
			color: '#ffffff'
		},
		
		tintColor:			'#ffffff',
		navTintColor:		'#c8d200',
		
		backButtonTitle:	'',
		translucent:		false,
		
		orientationModes:	[Ti.UI.PORTRAIT]
    };
    
    
	// toggle menu button
    this.menuButton = {
		
		width:	Ti.UI.SIZE,
		height:	Ti.UI.SIZE,
		
		image:	'/assets/icons/menu/hamburger.png',
		id:		L('menuButtonID')
		
		
	}; // END menuButton


	// context menu button
	this.contextMenuButton = {
		
		width:	Ti.UI.SIZE,
		height:	Ti.UI.SIZE,
		
		image:	'/assets/icons/menu/context.png',
		id:		L('contextMenuButtonID')
		
	}; // END contextMenuButton
	
	
	// back button
	this.backNavBarButton = {
		title:	'',
		image:	'/assets/icons/menu/icon_back.png'
	};


	// share button
	this.shareButton = {
		
		width:			Ti.UI.SIZE,
		height:			Ti.UI.SIZE,
		
		systemButton:	Ti.UI.iPhone.SystemButton.ACTION,
		id:				L('shareButtonID')
		
	}; // END shareButton
	
	
	// add button
	this.addButton = {
		
		width:			Ti.UI.SIZE,
		height:			Ti.UI.SIZE,
		
		systemButton:	Ti.UI.iPhone.SystemButton.ADD,
		tintColor:		'#4ead54',
		id:				L('addButtonID')
		
	}; // END addButton
	
	
	// save button
	this.saveButton = {
		
		width:		Ti.UI.SIZE,
		height:		Ti.UI.SIZE,
		
		title:		L('saveButtonTitle'),
		id:			L('saveButtonID'),
		
		tintColor:	'#4ead54'
		
	}; // END saveButton
	
	
	// close button
	this.closeButton = {
		
		width:		Ti.UI.SIZE,
		height:		Ti.UI.SIZE,
		
		title:		L('closeButtonTitle'),
		id:			L('closeButtonID'),
		
		tintColor:	'#4ead54'
		
	}; // END closeButton
    
    
    // post button
    this.postButton = {
    	image:	'/assets/icons/social/post.png'
    };
    
    
    // reload button
    this.reloadButton = {
    	systemButton: Ti.UI.iPhone.SystemButton.REFRESH
    };
    
    
    // favorite button 
    this.favoriteButton = {
    	imageInactive:	'/assets/images/events/icon_favorite_disabled.png',
    	imageActive:	'/assets/images/events/icon_favorite.png',
    	
    	tintColor:		'#6687ab'
    };
    
    
    // show location button
    this.locationButton = {
    	image:		'/assets/images/terrain/icon_location.png',
    	enabled:	false
    };
    
    
    // table view pull to refresh header
    this.pullToRefreshHeader = {
    	
    	tintColor:	'#c8c7cc',
		textColor:	'#000000'
    };
    
    
    // activity indicator
    this.loadingSpinner = {
    	
    	color:	'#a9a9ad',
		style:	Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
		
		font: {
			fontSize: 12
		},
		
		zIndex:	11
    };
    
    
    // table view loading row
    this.loadingRow = {
    	
		selectionStyle:	Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
		className:		'loading'
    };
    
    
    // video player
    this.videoPlayer = {
		videoPlayer: {
			
			backgroundColor:	this.window.backgroundColor,
			tintColor:			'#c8d200'
		}	
	};


	// default list view
	this.listView = {
		
		view: {
			
			width:				Ti.UI.FILL,
	        height:				Ti.UI.SIZE,
			
			top:				0,
			
	        backgroundColor:	'transparent',
	        separatorInsets:	{
	        	left:	0,
	        	right:	0	
	        }
		},
		
		pullToRefreshHeader: {},
		
		rows: {
			
			row: {
				
				hasChild:		true,
				selectionStyle:	Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
				className:		'DefaultListViewRow'
			}
		},
		
		loadingRow: {
			
			row: {
				
				height: 		(Tools.deviceHeight - Tools.statusBarHeight - Tools.navigationBarHeight),				
	    		selectionStyle:	Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
	    		className:		'loading'
			},
			
			loadingSpinner: {
				
				style: 	Ti.UI.iPhone.ActivityIndicatorStyle.DARK
			} 
		},
		
		noDataRow: {
			
			row: {
				
				width:			Ti.UI.FILL,
				height:			Ti.UI.FILL,
				
				className:		'noData',
				selectionStyle:	Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
				
			}
		}
		
	}; // END listView
	
	
	// mini browser
	this.miniBrowser = {
		
		window: Tools.merge({
			
			title:				undefined,
			orientationModes:	[Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]
			
		}, this.window),
		
		webView: {
			
			loading:			false,
			disableBounce:		true,
			backgroundColor:	'transparent',
			backgroundImage:	'transparent'
		},
		
		activityIndicator: {
			style:	Ti.UI.iPhone.ActivityIndicatorStyle.DARK
		},
		
		buttonBack: {
			
			image:		'/assets/icons/minibrowser/icon_back.png',
			enabled:	false
		},
		
		buttonForward: {
			
			image:		'/assets/icons/minibrowser/icon_forward.png',
			enabled:	false
		},
		
		buttonRefresh: {
			systemButton:	Ti.UI.iPhone.SystemButton.REFRESH
		},
		
		buttonStop: {
			systemButton:	Ti.UI.iPhone.SystemButton.STOP
		},
		
		buttonSpace: {
			systemButton:	Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
		},
		
		toolbar: {
			
			height:		44,
			bottom:		0,
			
			barColor:	this.window.barColor,
			tintColor:	this.window.navTintColor
		}
		
	}; // END miniBrowser
	
	
	// SwipaleTableViewRow
	this.swipableTableViewRow = {
		
		viewProxy: {

			height:				Ti.UI.SIZE,
			
			selectionStyle:		Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
			className:			'SwipableRow',
			backgroundColor:	'transparent'
		},
		
		_scrollView: {
			
			width:				Ti.UI.FILL,
			height:				Ti.UI.SIZE,
				
			top:				0,
			left:				0,
			
			layout:				'horizontal',
			scrollType:			'horizontal',
			
			contentWidth:		'auto',
			contentHeight:		'auto',
			
			scrollingEnabled:	false,
			disableBounce:		true,
			visible:			false
		},
		
		_contentView: {
			
			width:	Ti.UI.FILL,
			height:	Ti.UI.SIZE,
			
			top:	0,
			left:	0
		},
		
		_titleView: {
			
			width:	Ti.UI.SIZE,
			height:	Ti.UI.SIZE,
			
			top:	10,
			right:	10,
			left:	10,
			bottom:	10,
			
			color:	'#000000'
		},
		
		_actionButtonContainer: {
			
			width:	Ti.UI.SIZE,
			height:	54,
			
			top:	0,
			left:	0,
					
			layout:	'horizontal'
		},
		
		_defaultDeleteButton: {
			
			width:				Ti.UI.SIZE,
			height:				Ti.UI.SIZE,
			
			right:				10,
			left:				10,
			
			title:				L('swipableRowButtonTitleDelete'),
			backgroundColor:	'#ff0000',	
			color:				'#ffffff'
		},
		
		_buttonContainer: {
			
			width:				Ti.UI.SIZE,
			height:				Ti.UI.FILL
		},
		
		minRowHeight: 54
		
	}; // END SwipaleTableViewRow


	// WebViewNotification
	this.webViewNotification = {
		
		viewProxy: {
			
			width:				Ti.UI.FILL,
			height:				27,
			top:				0,
			
			zIndex:				99,
			anchorPoint:		{x: 0.5, y: 0.5},
			transform:			Ti.UI.create2DMatrix({scale: 0}),
			
			backgroundColor:	'#4ead54',
			
			borderWidth:		0,
			borderColor:		'transparent'
		},
		
		_separator: {
			
			width:				Ti.UI.FILL,
			height:				1,
			top:				0,
			backgroundColor:	'#ffffff'
		},
		
		_notificationMessage: {
			
			width:		Ti.UI.FILL,
			height:		26,
			
			top:		1,
			left:		5,
			right:		5,
			
			text:		L('webViewLoadingMessage'),
			color:		'#ffffff',
			textAlign:	Ti.UI.TEXT_ALIGNMENT_CENTER,
			
			font: {
				fontSize:	12
			},
			
			borderWidth:	0,
			borderColor:	'transparent'
		}
		
	}; // END webViewNotification
	
	
	// WebView
	this.webView = {
		
		viewProxy: {
			
			width:				Ti.UI.FILL,
			height: 			Ti.UI.FILL,
			
			backgroundColor:	'transparent'
		}
		
	}; // END webView


	// RatingBar
	this.ratingBar = {
		
		viewProxy: {
			
			width:				Ti.UI.SIZE,
			height:				Ti.UI.SIZE,
			
			layout:				'horizontal',
			backgroundColor:	'transparent'
		},
		
		rating: {
			
			width:	32,
			height:	30,
			right:	1
		},
		
		ratingImagePathEmpty:	'/assets/icons/ratingbar/rating_empty.png',
		ratingImagePathHalf:	'/assets/icons/ratingbar/rating_half.png',
		ratingImagePathFull:	'/assets/icons/ratingbar/rating_full.png'
		
	}; 
	
	this.ratingBar.rating.image = this.ratingBar.ratingImagePathEmpty; 
	// END ratingBar


	// CheckBox
	this.checkBox = {
		
		viewProxy: {
		
			width:				Ti.UI.SIZE,
			height:				Ti.UI.SIZE,
			
			top:				8,
			left:				20,
			
			layout:				'horizontal',
			backgroundColor:	'transparent'
		},
		
		_checkBox: {
			
			width:				32,
			height:				32,
			
			borderWidth:		1,
			borderRadius:		16,
			borderColor:		'#c7c7c7',
			backgroundColor:	'#ffffff',
			
			color:				'#ffffff',
			selectedColor:		'#ffffff'
		},
		
		_checkBoxLabel: {
			
			width:	Ti.UI.SIZE,
			height:	Ti.UI.SIZE,
			
			left:	7,
			
			color:	'#000000',
			font: {
				fontSize: 16
			}
		}
		
	}; // END checkBox
    
    
    /* ---------------------------------------
	 * specific styles
	 * --------------------------------------- */

	
	
	// return all these objects
	return this;
   
} // END Stylesheet()


// Provide public access to CommonJS module
module.exports = Stylesheet;
