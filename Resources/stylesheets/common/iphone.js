/*
 * iphone.js
 *
 * /Resources/stylesheets/common/iphone.js
 *
 * This module provides the common iPhone styles
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
 * iPhone specific common stylesheet module
 *
 * @contructor
 * @method Stylesheet
 * @return {Stylesheet} this
 */
function Stylesheet() {

	// load requirements
	var Tools = require('/helpers/common/tools'),
	    Globals = require('/helpers/common/globals');


	/* ---------------------------------------
	 * common styles
	 * --------------------------------------- */

	// colors
	this.highlightColor = '#4ead54';
	this.baseColor = '#c7c7c7';
	this.relatedBaseColor = '#f6f5f2';


	// windows
    this.window = {

		backgroundColor:	'#ffffff',
		barColor:			this.relatedBaseColor,

		titleAttributes:	{

			color: '#000000',
			font: {
				fontWeight: 'normal',
				fontSize:	18
			}
		},

		tintColor:			'#353534',
		navTintColor:		this.baseColor,

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
		tintColor:		this.highlightColor,
		id:				L('addButtonID')

	}; // END addButton


	// save button
	this.saveButton = {

		width:		Ti.UI.SIZE,
		height:		Ti.UI.SIZE,

		title:		L('saveButtonTitle'),
		id:			L('saveButtonID'),

		tintColor:	this.highlightColor

	}; // END saveButton


	// close button
	this.closeButton = {

		width:		Ti.UI.SIZE,
		height:		Ti.UI.SIZE,

		title:		L('closeButtonTitle'),
		id:			L('closeButtonID'),

		tintColor:	this.highlightColor

	}; // END closeButton


	// default list view
	this.listView = {

		viewProxy: {

			width:              Ti.UI.FILL,
			height:             Ti.UI.FILL,

			top:                0,

			backgroundColor:    'transparent'
		},

		listView: {

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
				selectionStyle:	Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
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

			loading:         false,
			disableBounce:   true,
			backgroundColor: 'transparent',
			backgroundImage: 'transparent',
			scrollsToTop:    true
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

			height: 44,
			bottom: 0,

			barColor:  this.window.barColor,
			tintColor: this.window.navTintColor
		}

	}; // END miniBrowser


	// SwipaleTableViewRow
	this.swipableTableViewRow = {

		viewProxy: {

			height: Ti.UI.SIZE,

			selectionStyle:          Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
			backgroundSelectedColor: this.baseColor,
			className:               'SwipableRow',
			backgroundColor:         'transparent'
		},

		_scrollView: {

			width:  Ti.UI.FILL,
			height: Ti.UI.SIZE,

			top:  0,
			left: 0,

			layout:     'horizontal',
			scrollType: 'horizontal',

			contentWidth:  'auto',
			contentHeight: 'auto',

			scrollingEnabled: false,
			disableBounce:    true,
			visible:          false,
			scrollsToTop:     false
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


	// Notification
	this.notification = {

		viewProxy: {

			width:				Ti.UI.FILL,
			height:				Ti.UI.SIZE,
			top:				-48,

			zIndex:				99,

			backgroundColor:	this.highlightColor,

			borderWidth:		0,
			borderColor:		'transparent'
		},

		_notificationMessage: {

			width:		Ti.UI.FILL,
			height:		Ti.UI.SIZE,

			top:		5,
			left:		5,
			right:		5,
			bottom:     5,


			text:		L('defaultLoadingMessage'),
			color:		'#ffffff',
			textAlign:	Ti.UI.TEXT_ALIGNMENT_CENTER,

			font: {
				fontSize:	12
			},

			borderWidth:	0,
			borderColor:	'transparent'
		}

	}; // END notification


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

			width:  Ti.UI.SIZE,
			height: Ti.UI.SIZE,

			layout:          'horizontal',
			backgroundColor: '#ffffff',
			opacity:         1
		},

		rating: {

			width:  32,
			height: 30,
			right:  1
		},

		ratingImagePathEmpty:      '/assets/icons/ratingbar/rating_empty.png',
		ratingImagePathHalf:       '/assets/icons/ratingbar/rating_half.png',
		ratingImagePathFull:       '/assets/icons/ratingbar/rating_full.png',
		ratingImagePathFullFilled: '/assets/icons/ratingbar/rating_full_filled.png'
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
			borderColor:		this.baseColor,
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


	// SettingsWindow
	this.settingsWindow = {

		title:           L('windowTitleSettings'),
		backgroundColor: this.relatedBaseColor

	}; // END settingsWindow


	// SettingsView
	this.settingsView = {

		viewProxy: {

			width:  Ti.UI.FILL,
			height: Ti.UI.FILL,

			backgroundColor: 'transparent'
		},

		listView: {

			width:  Ti.UI.FILL,
			height: Ti.UI.FILL,
			top:    0,

			minRowHeight:    44,
			style:           Titanium.UI.iPhone.TableViewStyle.GROUPED,
			backgroundColor: 'transparent'
		},

		loadingRow: this.listView.loadingRow,

		rows: {

			row: {

				hasChild:                false,
				className:               'SettingsView',
				selectionStyle:          Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
				selectedBackgroundColor: this.baseColor,
				backgroundColor:         '#ffffff',
				touchEnabled:            false
			},

			supportRow: {

				hasChild:                true,
				className:               'SettingsViewSupportRow',
				selectionStyle:          Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
				selectedBackgroundColor: this.baseColor,
				backgroundColor:         '#ffffff',
				touchEnabled:            true,

				title:  L('settingsTitleSupport')
			},

			switch: {

				onTintColor: this.highlightColor,
				right:       15
			},

			label: {
				right: 15
			},

			textField: {

				right:         15,
				disabledColor: this.baseColor
			}
		},

		loadingView: {

			width:  Ti.UI.FILL,
			height: Ti.UI.FILL,

			backgroundColor: this.relatedBaseColor,
			opacity:         0.7,
			visible:         false
		},

		loadingSpinner: {

			style:  Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
			zIndex: 77
		}

	}; // END settingsView




    /* ---------------------------------------
	 * specific styles
	 * --------------------------------------- */

	// exampleListView
	this.exampleListView = {

		viewProxy:				this.listView.viewProxy,
		listView:				this.listView.listView,
		pullToRefreshControl:	this.listView.pullToRefreshHeader,
		noDataRow:				this.listView.noDataRow,

		loadingRow: {

			row: {

				height: 		(Tools.deviceHeight - Tools.statusBarHeight - Tools.navigationBarHeight - 48), // 48 for ViewPager Tab Height
	    		selectionStyle:	Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
	    		className:		'loading'
			},

			loadingSpinner: this.listView.loadingRow.loadingSpinner
		},

		rows: {

			row: {

				hasChild:					false,
				selectionStyle:				Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY,
				selectedBackgroundColor:	this.baseColor,
				className:					'MediaLibraryListViewRow'
			},

			contentContainer: {

				width:	Ti.UI.FILL,
				height:	Ti.UI.SIZE,

				top:	20,
				right:	20,
				bottom:	20,
				left:	20,

				layout:	'vertical'
			},

			imageContainer: {

				width:				Ti.UI.SIZE,
				height:				Ti.UI.SIZE,

				backgroundColor:	'transparent'
			},

			image: {

				preventDefaultImage: true,

				width:  (Tools.deviceWidth - 40),
				height: 158,

				contentMode:     'aspectfill',
				backgroundColor: this.baseColor
			},

			imageSource: {

				width:	Ti.UI.FILL,
				height:	Ti.UI.SIZE,

				left:   5,
				right:	5,
				bottom:	5,

				textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
				color:     '#ffffff',
				font:      {

					fontSize: 10
				}
			},

			title: {

				width:	Ti.UI.FILL,
				height:	Ti.UI.SIZE,

				top:	10,

				color:	this.highlightColor,
				font: {
					fontSize: 16
				}
			},

			teaser: {

				width:	Ti.UI.FILL,
				height:	Ti.UI.SIZE,

				top:	10,

				color:	'#000000',
				font: {
					fontSize: 13
				}
			}
		}

	}; // END exampleListView


	// GC
	Globals = null;
	Tools = null;


	// return all these objects
	return this;

} // END Stylesheet()


// provide public access to module
module.exports = Stylesheet;