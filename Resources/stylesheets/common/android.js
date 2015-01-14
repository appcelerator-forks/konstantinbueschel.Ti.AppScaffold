/*
 * android.js
 *
 * /Resources/stylesheets/common/android.js
 *
 * This module represents the common Android styles
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

// statefull private module variables
var pixelDeviceWidth  = Ti.Platform.displayCaps.platformWidth,
    pixelDeviceHeight = Ti.Platform.displayCaps.platformHeight;


/**
 * Android specific common stylesheet module
 *
 * @constructor
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

		backgroundColor:  '#ffffff',
		exitOnClose:      false,
		orientationModes: [Ti.UI.PORTRAIT]
	};


	// share button
	this.shareButton = {

		icon:         Ti.App.Android.R.drawable.ic_action_share,
		showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS,
		id:           L('shareButtonID')

	}; // END shareButton


	// add button
	this.addButton = {

		icon:         '',
		showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS,
		id:           L('addButtonID')

	}; // END addButton


	// save button
	this.saveButton = {

		icon:         '',
		showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS,
		id:           L('saveButtonID')

	}; // END saveButton


	// close button
	this.closeButton = {

		width:  Ti.UI.SIZE,
		height: Ti.UI.SIZE,

		title: L('closeButtonTitle'),
		id:    L('closeButtonID')

	}; // END closeButton


	// loading bar
	this.loadingBarProxy = {

		width:  Ti.UI.FILL,
		height: 6,

		top:   0,
		color: this.highlightColor,

		sectionsCount:   3,
		separatorLength: 12,
		strokeWidth:     10,

		mirrorMode: true,
		reversed:   true,
		visible:    false,

		speed:        2,
		interpolator: 3,

		zIndex: 91

	}; // END loadingBarProxy


	// fake loading bar
	this.loadingBar = {

		width:  0,
		height: 6,
		top:    0,

		backgroundColor: this.highlightColor

	}; // END loadingBar


	// default list view
	this.listView = {

		viewProxy: {

			width:  Ti.UI.FILL,
			height: Ti.UI.FILL,
			top:    0,

			backgroundColor: 'transparent'
		},

		loadingBar: this.loadingBar,
		loadingBarProxy: this.loadingBarProxy,

		listView: {

			width:  Ti.UI.FILL,
			height: Ti.UI.SIZE,
			top:    0,

			backgroundColor: 'transparent'
		},

		rows: {

			row: {
				className: 'DefaultListViewRow'
			}
		},

		loadingRow: {

			row: {
				className:    'loading',
				touchEnabled: false
			},

			loadingSpinner: {

				height: 48,
				style:  Ti.UI.ActivityIndicatorStyle.BIG_DARK
			}
		},

		loadingWidget: {

			row: {
				className:    'loadingWidget',
				touchEnabled: false
			},

			loadingSpinner: {

				height: 48,
				style:  Ti.UI.ActivityIndicatorStyle.BIG_DARK
			}
		},

		noDataRow: {

			row: {

				width:  Ti.UI.FILL,
				height: Ti.UI.FILL,

				className: 'noData'
			}
		}

	}; // END listView


	// mini browser
	this.miniBrowser = {

		window: Tools.merge({

			title:            undefined,
			orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]

		}, this.window),

		viewProxy: {

			width:  Ti.UI.FILL,
			height: Ti.UI.FILL,

			backgroundColor: '#ffffff'
		},

		webView: {

			loading:       false,
			disableBounce: true,

			backgroundColor: 'transparent',
			backgroundImage: 'transparent',

			cacheMode:          Ti.UI.Android.WEBVIEW_LOAD_NO_CACHE,
			enableZoomControls: false
		},

		activityIndicator: {},

		buttonBack: {

			image:                   '/images/icons/minibrowser/ic_navigation_backward.png',
			backgroundImage:         'transparent',
			backgroundSelectedColor: '#eeeeee',
			backgroundDisabledColor: 'transparent',
			width:                   56,
			enabled:                 false
		},

		buttonForward: {

			image:                   '/images/icons/minibrowser/ic_navigation_forward.png',
			backgroundImage:         'transparent',
			backgroundSelectedColor: '#eeeeee',
			backgroundDisabledColor: 'transparent',
			width:                   56,
			enabled:                 false
		},

		buttonRefresh: {

			image:                   '/images/icons/minibrowser/ic_navigation_refresh.png',
			backgroundImage:         'transparent',
			backgroundSelectedColor: '#eeeeee',
			backgroundDisabledColor: 'transparent',
			width:                   56,
			enabled:                 false
		},

		buttonStop: {

			image:                   '/images/icons/minibrowser/ic_navigation_stop.png',
			backgroundImage:         'transparent',
			backgroundSelectedColor: '#eeeeee',
			backgroundDisabledColor: 'transparent',
			width:                   56
		},

		_buttonWrapper: {

			width:           '25%',
			backgroundColor: 'transparent'
		},

		buttonShare: {

			icon:         '/images/icons/minibrowser/ic_action_share.png',
			showAsAction: Ti.Android.SHOW_AS_ACTION_ALWAYS,
			itemId:       Globals.menu.Android.ITEM_ID_SHARE
		},

		toolbar: {

			width:           Ti.UI.FILL,
			height:          44,
			bottom:          0,
			layout:          'horizontal',
			backgroundColor: 'transparent'
		},

		loadingBar: this.loadingBarProxy

	}; // END miniBrowser


	// WebView
	this.webView = {

		viewProxy: {

			width:  Ti.UI.FILL,
			height: Ti.UI.FILL,

			backgroundColor: 'transparent'
		},

		_loadingBar: this.loadingBarProxy

	}; // END webView


	// Notification
	this.notification = {

		viewProxy: {

			width:  Ti.UI.FILL,
			height: Ti.UI.SIZE,

			top:    -48,
			zIndex: 99,

			backgroundColor: this.highlightColor,

			borderWidth: 0,
			borderColor: 'transparent'
		},

		_notificationMessage: {

			width:  Ti.UI.FILL,
			height: Ti.UI.SIZE,

			top:    5,
			left:   5,
			right:  5,
			bottom: 5,


			text:      L('defaultLoadingMessage'),
			color:     '#ffffff',
			textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,

			font: {
				fontSize: 12
			},

			borderWidth: 0,
			borderColor: 'transparent'
		}

	}; // END notification


	// RootWindow
	this.rootWindow = {

		exitOnClose: true

	}; // END rootWindow


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

		ratingImagePathEmpty:      '/images/icons/ratingbar/ic_rating_empty.png',
		ratingImagePathHalf:       '/images/icons/ratingbar/ic_rating_half.png',
		ratingImagePathFull:       '/images/icons/ratingbar/ic_rating_full.png',
		ratingImagePathFullFilled: '/images/icons/ratingbar/ic_rating_full_filled.png'
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

	}; // CheckBox




    /* ---------------------------------------
	 * specific styles
	 * --------------------------------------- */

	// ExampleListView
	this.exampleListView = {

		viewProxy:       this.listView.viewProxy,
		loadingBar:      this.listView.loadingBar,
		loadingBarProxy: this.listView.loadingBarProxy,
		listView:        this.listView.listView,
		loadingRow:      this.listView.loadingRow,
		loadingWidget:   this.listView.loadingWidget,
		noDataRow:       this.listView.noDataRow,

		rows: {

			row: {

				backgroundSelectedColor: this.baseColor,
				className:               'ExampleListView'
			},

			contentContainer: {

				width:  Ti.UI.FILL,
				height: Ti.UI.SIZE,

				top:    20,
				right:  20,
				bottom: 20,
				left:   20,

				layout:       'vertical',
				touchEnabled: false
			},

			imageContainer: {

				width:  Ti.UI.SIZE,
				height: Ti.UI.SIZE,

				backgroundColor: 'transparent',
				touchEnabled:    false
			},

			image: {

				preventDefaultImage: true,

				width:  (Tools.deviceWidth - 40),
				height: 158,

				backgroundColor: this.baseColor,
				touchEnabled:    false
			},

			imageSource: {

				width:  (Tools.deviceWidth - 50),
				height: Ti.UI.SIZE,

				right:  5,
				bottom: 5,

				textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
				color:     '#ffffff',
				font:      {

					fontSize: 10
				},

				touchEnabled: false
			},

			title: {

				width:  Ti.UI.FILL,
				height: Ti.UI.SIZE,

				top: 10,

				color: this.highlightColor,
				font:  {
					fontSize: 16
				},

				touchEnabled: false
			},

			teaser: {

				width:  Ti.UI.FILL,
				height: Ti.UI.SIZE,

				top: 10,

				color:        '#000000',
				font:         {
					fontSize: 13
				},

				touchEnabled: false
			}
		}

	}; // END exampleListView


	// GC
	Globals = null;
	Tools = null;


	// return all these objects
	return this;

} // END Stylesheet()


// Provide public access to CommonJS module
module.exports = Stylesheet;
