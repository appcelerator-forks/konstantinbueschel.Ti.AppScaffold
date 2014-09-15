/*
 * Hessentag 2014
 * 
 * android.js
 * 
 * /Resources/stylesheets/common/android.js
 * 
 * This module represents the common Android styles
 * 
 * Author:		kbueschel
 * Date:		2014-06-06
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
var pixelDeviceWidth =		Ti.Platform.displayCaps.platformWidth;
var pixelDeviceHeight =		Ti.Platform.displayCaps.platformHeight;


/**
 * Android specific common stylesheet module
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
		
		exitOnClose:		false,
		orientationModes:	[Ti.UI.PORTRAIT]
    };
    
    
    // refresh menu option
    this.refreshMenuOption = {
    	icon:			Ti.App.Android.R.drawable.ic_action_navigation_refresh,
        showAsAction:	Ti.Android.SHOW_AS_ACTION_ALWAYS,
    };
    
    
    // post to facebook menu option
    this.facebookPostMenuOption = {
        icon:			Ti.App.Android.R.drawable.ic_action_post_to,
		showAsAction:	Ti.Android.SHOW_AS_ACTION_ALWAYS
    };
    
    
    // share menu option
    this.shareMenuOption = {
    	icon:			Ti.App.Android.R.drawable.ic_action_share,
    	showAsAction:	Ti.Android.SHOW_AS_ACTION_ALWAYS
    };
    
    
    // show location menu option
    this.showParkingLocationMenuOption = {
    	icon:			Ti.App.Android.R.drawable.ic_action_show_parking_location,
    	showAsAction:	Ti.Android.SHOW_AS_ACTION_ALWAYS
    };

    
    // table view pull to refresh header
    this.pullToRefreshHeader = {
		textColor:	'#000000'
    };
    
    
    // activity indicator
    this.loadingSpinner = {
    	
    	color:	'#a9a9ad',
		
		font: {
			fontSize: 12
		},
		
		style:	Ti.UI.ActivityIndicatorStyle.BIG_DARK,
		
		zIndex:	55
    };
    
    
    // table view loading row
    this.loadingRow = {
		className: 'loading'
    };
    
    
	// loadingbar container    
    this.loadingBarContainer = {
    	
    	width:	Ti.UI.FILL,
		height:	Ti.UI.SIZE,
		
		zIndex:	99
    };

    
    // loadingbar
    this.loadingBar = {
    	
    	width:				Ti.UI.FILL,
		height:				6,
		
		top:				0,
		color: 				'#c8d200',
		
		sectionsCount: 		3,
		separatorLength:	12,
		strokeWidth:		10,
		
		mirrorMode:			true,
		reversed:			true,
		
		speed: 				2,
		interpolator: 		3,
		
		zIndex:	99
    };
    
    
    // video player
    this.videoPlayer = {
		videoPlayer: {
			
			backgroundColor:	this.window.backgroundColor
		}	
	};
    
    
    /* ---------------------------------------
	 * specific styles
	 * --------------------------------------- */
	
    // home window style
    this.homeWindow = Tools.merge({
    	
    	title: L('windowTitleHome')
    	
    }, this.window);
    
    
    // news tabgroup style
    this.newsTabGroup = {
    	
    	tabGroup: {
    		title:	L('windowTitleNews')
    	},
    	
    	newsTab: {
    		title:			L('tabTitleNews'),
			icon:			Ti.App.Android.R.drawable.tab_icon_news_ab_hessentag
    	},
    	
    	journalTab: {
    		title:			L('tabTitlePressReleases'),
			icon:			Ti.App.Android.R.drawable.tab_icon_press_ab_hessentag
    	}
    };
    
    
    // press release window style
    this.pressWindow = this.window;
    
    
    // news window style
    this.newsWindow = Tools.merge({
    	
    	layout:	'vertical'
    	
    }, this.window);
    
    
	// tidings view styles
	this.tidingsListView = {
		
		view: {
			width:				Ti.UI.FILL,
	        height:				Ti.UI.FILL,
			
			top:				0,
			
	        backgroundColor:	'transparent',
	        separatorColor:		this.tableView.separatorColor
		},
		
		pullToRefreshHeader: {
    	
    		message: 	L('pullToRefreshHeaderMessageTidingsView'),
			textColor:	this.pullToRefreshHeader.textColor
   		},
		
		loadingBarContainer: this.loadingBarContainer,
		loadingBar: this.loadingBar,
		
		tidings: {
			
			row: {
				className:	'tiding'
			},
			
			containerBox: {
				
				top: 	10,
				left:	10,
				bottom:	10,
				
				width:	Ti.UI.FILL,
				height:	69,
				
				layout:	'horizontal'
			},
			
			image: {
				
				preventDefaultImage:	true,
				
				width:					69,
				height:					69,
				
				right:					12,
				
				backgroundColor:		this.imageView.backgroundColor,
				borderColor:			'#c8c7cc'
			},
			
			descriptionBox: {
				
				height:	69,
				layout:	'vertical'
			},
			
			title: {
				
				height:		18,
				top:		5,
				
				ellipsize:	true,	
				color:		this.titleColor,
				font: {
					
					fontWeight:	'bold',
					fontSize: 	14
				}
			},
			
			date: {
					
				color:	this.textColor,
				font:	{
					
					fontSize: 12
				},
				
				height:	16,
				top:	4
			},
			
			subtitle: {
				
				height:		16,
				top:		2,
				
				ellipsize:	true,	
				color:		this.textColor,
				font: {
					
					fontSize: 12
				}
			}
		},
		
		loadingRow: {
			
			row: {
				
				height: 		(Tools.deviceHeight - Tools.getAndroidStatusbarHeight() - 100),				
	    		className:		this.loadingRow.className
			},
			
			loadingSpinner: this.loadingSpinner 
		}
	};
	
	
	// detail window style
	this.detailWindow = {
		
		view: {
			
			width:				Ti.UI.FILL,
			height:				Ti.UI.FILL,
			
			layout:				'vertical'
		},
		
		mainImage: {
			
			preventDefaultImage:	true,
			
			width:					Ti.UI.FILL,
			height:					190,
			
			top:					0,
			left:					0,
			
			backgroundColor:		this.imageView.backgroundColor
		},
		
		webView: {
			
			disableBounce:      	true,
	        touchEnabled:       	true,
	        scalesPageToFit:    	true,
	        willHandleTouches:  	false,
	        hideLoadIndicator:  	false,
	        softKeyboardOnFocus:	Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS,
	        
	        width:              	Ti.UI.FILL,
	        height:             	Ti.UI.FILL,    
	            
	        backgroundColor:    	'transparent',
	        zIndex:             	10
		}
	};
	
	
	// event window styles
	this.eventsWindow = {
		
		window: Tools.merge({
			
			title:	L('windowTitleEvents'),
			layout:	'vertical'
			
		}, this.window),
		
		view: {
			
			filterAttribute:		'searchKeyword',
			
			editable:				true,
			hideSearchOnSelection:	false,
						
			width:					Ti.UI.FILL,
			top:					0,
			
			backgroundColor:		'transparent',
	        
	        separatorColor:			this.tableView.separatorColor
		},
		
		searchBar: {
			
			hintText:			L('searchBarHintTextDefault'),
			
			barColor:			'#d5d5d9',
			backgroundColor:	'#d5d5d9',
			
			borderColor:		'#d0d0d4'
		},
		
		row: {
			
			color: '#000000'
		},
		
		rowTitle: {
			
			width:		Ti.UI.FILL,
			height:		Ti.UI.SIZE,
			
			wordWrap:	true,
			ellipsize:	true,
			
			top:		10,
			left:		10,
			right:		10,
			bottom:		10,
			
			color:		'#000000'
		},
		
		loadingRow: {
			
			row: {
				
				height: 		(Tools.deviceHeight - Tools.getAndroidStatusbarHeight() - 50),				
	    		className:		this.loadingRow.className
			},
			
			loadingSpinner: this.loadingSpinner
		},
		
		editButton: {},
		cancelEditButton: {},
		
		eventsSelectionListView: {
			
			containerBox: {
				
				top: 	10,
				left:	10,
				bottom:	10,
				
				width:	Ti.UI.FILL,
				height:	69,
				
				layout:	'horizontal'
			},
			
			image: {
				
				preventDefaultImage:	true,
				
				width:					69,
				height:					69,
				
				right:					12,
				
				backgroundColor:		this.imageView.backgroundColor,
				borderColor:			'#c8c7cc'
			},
			
			descriptionBox: {
				
				height:	69,
				layout:	'vertical'
			},
			
			title: {
				
				height:		18,
				top:		5,
					
				ellipsize:	true,
				color:		this.titleColor,
				font: {
					
					fontWeight:	'bold',
					fontSize: 	14
				}
			},
			
			date: {
				
				height:		16,
				top:		4,
				
				ellipsize:	true,					
				color:		this.textColor,
				font: {
					
					fontSize: 12
				}
			},
			
			subtitle: {
				
				height:		16,
				top:		2,
				
				ellipsize:	true,	
				color:		this.textColor,
				font: {
					
					fontSize: 12
				}
			}
		}
	};
	
	
	// multimedia window style
    this.imagesWindow = Tools.merge({
    	
    	layout:	'vertical'
    	
    }, this.window);
    
    
    // news tabgroup style
    this.multimediaTabGroup = {
    	
    	tabGroup: {
    		title:	L('windowTitleMultimedia')
    	},
    	
    	imagesTab: {
    		title:			L('tabTitleImages'),
			icon:			Ti.App.Android.R.drawable.tab_icon_news_ab_hessentag
    	}
    };
    
	
	// multimedia list view styles
	this.mediaListView = {
		
		view: {
			width:				Ti.UI.FILL,
	        height:				Ti.UI.FILL,
			
			top:				0,
			
	        backgroundColor:	'transparent',
	        separatorColor:		'transparent'
		},
		
		pullToRefreshHeader: {
    	
    		message: 	L('pullToRefreshHeaderMessageMultimediaView'),
			textColor:	this.pullToRefreshHeader.textColor
   		},
   		
   		loadingBarContainer: this.loadingBarContainer,
		loadingBar: this.loadingBar,
		
		media: {
			
			row: {
				className: 'media'
			},
			
			containerBox: {
				
				top: 	5,
				left:	10,
				bottom:	5,
				
				width:	Ti.UI.FILL,
				height:	75,
				
				layout:	'horizontal'
			},
			
			stackImagesContainer: {
				
				width:	69,
				height:	75,
				
				right:	18,
				
				layout:	'vertical'
			},
			
			stackImages: [
				{
					preventDefaultImage:	true,
					
					width:					60,
					height:					1,
					
					top: 					0,
					
					backgroundColor:		this.imageView.backgroundColor
				},
				{
					preventDefaultImage:	true,
					
					width:					65,
					height:					1,
					
					top:					1,
					
					backgroundColor:		this.imageView.backgroundColor
				},
				{
					preventDefaultImage:	true,
					
					width:					69,
					height:					69,
					
					top:					1,
					
					backgroundColor:		this.imageView.backgroundColor
				}
			],
			
			videoIcon: {
				
				width:				24,
				height:				16,
				
				left:				2,
				bottom:				2,
				
				backgroundImage:	'/assets/images/multimedia/icon_media_type_video.png'
			},
			
			informationBox: {
				
				width:	Ti.UI.FILL,
				height:	75,
				layout:	'vertical'
			},
			
			title: {
					
				color:	this.titleColor,
				font:	{
					
					fontWeight:	'bold',
					fontSize: 	14
				},
				
				width:	Ti.UI.FILL,
				height:	18,
				top:	16
			},
			
			count: {
					
				color:	this.textColor,
				font:	{
					
					fontSize: 12
				},
				
				width:	Ti.UI.FILL,
				height:	16,
				top:	6
			}
		},
		
		loadingRow: {
			
			row: {
				
				height: 		(Tools.deviceHeight - Tools.getAndroidStatusbarHeight() - 100),				
	    		className:		this.loadingRow.className
			},
			
			loadingSpinner: this.loadingSpinner
		}
	};
	
	
	// multimedia detail window style
	this.multimediaDetailWindow = {
		
		loadingView: { 
			
			message:	L('loadingSpinnerMessageMultimediaView'),

			color:		this.loadingSpinner.color,
			font:		this.loadingSpinner.font
		}, 
		
		mediaCount: {
			
			width:		Tools.deviceWidth,
			height:		49,
			
			bottom:		0,
			
			textAlign:	Ti.UI.TEXT_ALIGNMENT_CENTER,
			color:		this.textColor
		},
		
		imageGrid: {
			space:	1,
			
			gridElement: {
				gridColor: this.imageView.backgroundColor
			}
		}
	};
	
	
	// image gallery window styles
	this.imageGalleryWindow = {
		
		navBarHiddenWindowBackgroundColor:	'#000000',
		navBarVisibleWindowBackgroundColor:	'#e6e6eb',
		
		window: Tools.combine({
			
			orientationModes: [Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT]
			
		}, this.window),
		
		scrollableView: {
			
			cacheSize:			2,
			showPagingControl:	false,
			pagingControlColor:	'transparent',
			
			top:				0,
			bottom:				0,
			right:				0,
			left:				0,
			
			backgroundColor:	'transparent'
		},
		
		galleryElement: {
			
			view: {
			
				width:	Tools.deviceWidth,
				height:	Tools.deviceHeight
			},
			
			imageView: {
				
				backgroundImage:		'transparent',
				preventDefaultImage:	true,
				visible:				false
			}
		}
	};
	
	
	// video player window
	this.videoPlayerWindow = Tools.merge({
		
		modal:		true,
		fullscreen:	true
		
	}, this.window);
	
	
	this.multimediaVideoPlayer = Tools.merge({
		
		videoPlayer: {
			
			visible: false
		}
		
	}, this.videoPlayer);
	
	
	// mini browser
	this.miniBrowser = {
		
		window: Tools.merge({
			
			title:					undefined,
			layout:					'vertical',
			orientationModes:		[Ti.UI.PORTRAIT, Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT],
			softKeyboardOnFocus:	Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS
			
		}, this.window),
		
		webView: {
			
			loading:				false,
			disableBounce:			true,
			softKeyboardOnFocus:	Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS,
			
			backgroundColor:		'transparent',
			backgroundImage:		'transparent'
		},
		
		loadingBarContainer: this.loadingBarContainer,
		loadingBar: this.loadingBar,
		
		buttonBack: {
			
			image:		'/assets/images/minibrowser/icon_back.png',
			enabled:	false
		},
		
		buttonForward: {
			
			image:		'/assets/images/minibrowser/icon_forward.png',
			enabled:	false
		},
		
		buttonRefresh: {
		},
		
		buttonStop: {
		},
		
		buttonSpace: {
		},
		
		toolbar: {
			
			height:		44,
			bottom:		0,
			
			barColor:	this.window.barColor
		}
	};
	
	
	// city tabgroup style
    this.cityTabGroup = {
    	
    	tabGroup: {
    		title:	L('windowTitleCity')
    	},
    	
    	contentTab: {
    		title:	L('tabTitleCity'),
			icon:	Ti.App.Android.R.drawable.tab_icon_city_ab_hessentag
    	},
    	
    	contentMovieTab: {
    		title:	L('tabTitleMovie'),
    		icon:	Ti.App.Android.R.drawable.tab_icon_movie_ab_hessentag
    	}
    };
    
	
	// content window
	var contentImageHeight = (600 / 800 * Tools.deviceWidth);
	
	this.contentWindow = {
		
		window:	this.window,
		
		contentImage: {
			
			image:						'/assets/images/city/hessentag2014_bensheim_st_georg.jpg',
	    	preventDefaultImage:		true,
	    	width:						Tools.deviceWidth,
	    	height:						contentImageHeight
		}
	};
	
	
	// content moview window
	this.contentMovieWindow = {
		
		window: this.window,
		
		movieVideoPlayer: {
			
			fullscreen:			true,
		    autoplay:			true,
		    
		    scalingMode:		Ti.Media.VIDEO_SCALING_ASPECT_FIT,
		    mediaControlMode:	Ti.Media.VIDEO_CONTROL_EMBEDDED,
		    
		    height:				contentImageHeight,
		    visible:			false,
		    
		    backgroundColor:	'#000000'
		},
		
		
		loadingSpinner:	this.loadingSpinner,
		
		videoPlayerContainerView: {
			
			width:				Ti.UI.FILL,
	    	height:				contentImageHeight,
	    	
	    	backgroundColor:	'transparent',
	    	backgroundImage:	'/assets/images/city/background_view_video_preview.jpg'
		},
		
		startVideoButtonContainer: {
			
			width:	Ti.UI.SIZE,
			height:	Ti.UI.SIZE	
		},
		
		startVideoButton: {
			
			image:					'/images/city/ic_av_play_over_video.png',
			
			width:					72,
			height:					72,
			
			backgroundImage:		'transparent',
			backgroundColor:		'transparent'
		}
	};
	
	
	// content view
	this.contentView = {
		
		view: {

			disableBounce:	true,
			
			width:			Ti.UI.FILL,
			height:			Ti.UI.SIZE,
			
			layout:			'vertical'
		},
		
		wrapper: {
			
			height:	Ti.UI.SIZE,
			
			top:	20,						
			left:	20,
			right:	20,
			
			layout:	'vertical'
		},
		
		title: {
			
			width:			Ti.UI.FILL,
			height:			Ti.UI.SIZE,
			
			bottom:			12,
			
			textAlignment:	Ti.UI.TEXT_ALIGNMENT_LEFT,
			
			color:			this.titleColor,
			font: {
				
				fontWeight:	'bold',
				fontSize: 	14
			}
		},
		
		content: {
			
			width:			Ti.UI.FILL,
			height:			Ti.UI.SIZE,
			
			bottom:			20,
			
			textAlignment:	Ti.UI.TEXT_ALIGNMENT_LEFT,
			
			color:			this.textColor,
			font: {
				
				fontSize: 12
			}
		}
	};
	
	
	// social tabgroup style
    this.socialTabGroup = {
    	
    	tabGroup: {
    		title:	L('windowTitleSocial')
    	},
    	
    	twitterTab: {
    		title:	L('tabTitleTwitter'),
			icon:	Ti.App.Android.R.drawable.tab_icon_twitter_ab_hessentag
    	},
    	
    	facebookTab: {
    		title:	L('tabTitleFacebook'),
    		icon:	Ti.App.Android.R.drawable.tab_icon_facebook_ab_hessentag
    	}
    };
    
	
	// twitter window
	this.twitterWindow = {
		
		window: Tools.merge({
			
			layout:	'vertical'
			
		}, this.window)
	};
	
	
	// twitter view
	this.twitterListView = {
		
		containerView: {
			
			width:	Ti.UI.FILL,
			height:	Ti.UI.FILL,
			
			layout:	'vertical'
		},
		
		view: {
		
			width:				Ti.UI.FILL,
	        height:				Ti.UI.FILL,
			
			top:				0,
				
	        backgroundColor:	'transparent',
	        separatorColor:		'transparent'
		},
		
		pullToRefreshHeader: {
    	
    		message: 	L('pullToRefreshHeaderMessageTwitterListView'),
			textColor:	this.pullToRefreshHeader.textColor
   		},
		
		loadingBarContainer: this.loadingBarContainer,
		loadingBar: this.loadingBar,
		
		tweet: {
			
			row: {
				className:	'tweet',
				height:		Ti.UI.SIZE
			},
			
			rowContainer: {
				
				width:	Ti.UI.FILL,
				height:	Ti.UI.SIZE,
				
				top:	10,
				left:	10,
				bottom:	10,
				
				layout:	'horizontal'
			},
			
			userImage: {
				preventDefaultImage:	true,
				
				width:					48, 
				height:					48,
				
				top:					0,
				
				borderRadius:			3,
				backgrondColor:			'#fff'
			},
			
			contentContainer: {
				
				height:	Ti.UI.SIZE,
				
				top:	0,
				left:	10,
				
				layout:	'vertical'
			},
			
			metaContainer: {
				height: 16
			},
			
			userName: {
				
				width:		Ti.UI.FILL,
				height:		16,
				left:		0,
				
				color:		this.textColor,
				font: {
					fontSize:	11,
					fontWeight:	'bold'
				},
				
				ellipsize:	true
			},
			
			time: {
				
				height:		16,
				right:		0,
			
				textAlign:	Ti.UI.TEXT_ALIGNMENT_RIGHT,
				color:		'#999',
				
				font: {
					fontSize:	11
				}
			},
			
			message: {
				
				width:		Ti.UI.SIZE,
				height:		Ti.UI.SIZE,
				
				left:		0,
				
				textAlign:	Ti.UI.TEXT_ALIGNMENT_LEFT,
				color:		this.textColor,
				font: {
					fontSize:	11
				},
				
				ellipsize:	true
			},
			
			image: {
				
				preventDefaultImage:	true,

				top:					10,
				borderRadius:			3
			}
		},
		
		loadingRow: {
			
			row: {
				
				height: 		(Tools.deviceHeight - Tools.getAndroidStatusbarHeight() - 100),				
	    		className:		this.loadingRow.className
			},
			
			loadingSpinner: this.loadingSpinner
		}
	};
	
	
	// twitter detail view
	this.twitterDetailView = {
		
		view: {
			disableBounce:					true,
			showVerticalScrollIndicator:	false,
			scrollType:						'vertical',
			
			width:							Ti.UI.FILL,
			height:							Ti.UI.FILL,
			
			contentWidth:					'auto',
			contentHeight:					'auto'
		},
		
		container: {
			height:				Ti.UI.SIZE,
			
			top:				10,
			right:				10,
			left:				10,
			bottom:				10,
			
			layout:				'vertical',
		
			borderWidth:		1,
			borderColor:		'#ddd',
			backgroundColor:	'#fff'
		},
		
		meta: {
			height:	Ti.UI.SIZE,
			
			top:	0,
			right:	0,
			left:	0,
			
			layout:	'horizontal'
		},
		
		userImage: {
			preventDefaultImage:	true,
			
			width:					48, 
			height:					48,
			
			top:					10,
			left:					10,
			right:					10,

			borderRadius:			3
		},
		
		nameContainer: {
			width:	Ti.UI.FILL,
			height:	Ti.UI.SIZE,
			
			top:	20,

			layout:	'vertical'
		},
		
		name: {
			width:		Ti.UI.FILL,
			
			left:		0,		
			right:		10,
	
			textAlign:	Ti.UI.TEXT_ALIGNMENT_LEFT,
			color:		this.textColor,
			font: {
				fontWeight:	'bold',
				fontSize:	13
			}
		},
		
		screenName: {
			width:		Ti.UI.FILL,
		
			left:		0,		
			right:		10,
	
			textAlign:	Ti.UI.TEXT_ALIGNMENT_LEFT,
			color:		'#999',
			font: {
				fontSize: 10
			}
		},
		
		tweet: {
			height:					84,
			
			top:					10,
			left:					10,
			right:					10,
			
			disableBounce:			true,
			enableZoomControls:		false,
			hideLoadIndicator:		true,
			softKeyboardOnFocus:	Ti.UI.Android.SOFT_KEYBOARD_HIDE_ON_FOCUS
		},
		
		tweetImage: {
			preventDefaultImage:	true,
			
			top:					10,
			left:					10,
			right:					10
		},
		
		time: {
			height:	22,
			
			top:	10,
			right:	10,
			bottom:	10,
			left:	10,
		
			color:	'#999',
			font: {
				fontSize: 11
			}
		}
	};
	
	
	// facebook window
	this.facebookWindow = {
		
		window: Tools.merge({
			
			layout:	'vertical'
			
		}, this.window)
	};
	
	
	// facebook view
	this.facebookListView = {
		
		containerView: {
			
			width:	Ti.UI.FILL,
			height:	Ti.UI.FILL,
			
			layout:	'vertical'
		},
		
		view: {
		
			width:				Ti.UI.FILL,
	        height:				Ti.UI.FILL,
			
			top:				0,
			
	        backgroundColor:	'transparent',
	        separatorColor:		'transparent'
		},
		
		pullToRefreshHeader: {
			textColor:	this.pullToRefreshHeader.textColor
   		},
   		
   		loadingBarContainer: this.loadingBarContainer,
		loadingBar: this.loadingBar,
		
		post: {
			
			row: {
				className: 'tweet'
			},
			
			rowContainer: {
				width:	Ti.UI.FILL,
				height:	Ti.UI.SIZE,
				
				top:	10,
				left:	10,
				bottom:	10,
				
				layout:	'horizontal'
			},
			
			userImage: {
				preventDefaultImage:	true,
				
				width:					48, 
				height:					48,
				
				top:					0,
				
				borderRadius:			3,
				backgrondColor:			'#fff'
			},
			
			contentContainer: {
				
				height:	Ti.UI.SIZE,
				
				top:	0,
				left:	10,
				
				layout:	'vertical'
			},
			
			metaContainer: {
				height: 15
			},
			
			userName: {
				
				height:		16,
				left:		0,
				
				ellipsize:	true,
				color:		this.textColor,
				
				font: {
					fontSize:	11,
					fontWeight:	'bold'
				}
			},
			
			time: {
				height:		16,
				right:		0,
			
				textAlign:	Ti.UI.TEXT_ALIGNMENT_RIGHT,
				color:		'#999',
				
				font: {
					fontSize:	11
				}
			},
			
			message: {
				
				height:		Ti.UI.SIZE,
				left:		0,
				
				textAlign:	Ti.UI.TEXT_ALIGNMENT_LEFT,
				color:		this.textColor,
				font: {
					fontSize:	11
				}
			},
			
			image: {
				preventDefaultImage:	true,

				top:					10,
				borderRadius:			3
			}
		},
		
		loadingRow: {
			
			row: {
				
				height: 		(Tools.deviceHeight - Tools.getAndroidStatusbarHeight() - 100),				
	    		className:		this.loadingRow.className
			},
			
			loadingSpinner: this.loadingSpinner
		}
	};
	
	
	// parking window
	this.parkingWindow = {
		
		window: this.window
	};
	
	
	// image map window
	this.imageMapWindow = {
		
		window: this.window
	};
	
	
	// terrain tabgroup style
    this.terrainTabGroup = {
    	
    	tabGroup: {
    		title:	L('windowTitleTerrain')
    	},
    	
    	imageMapTab: {
    		title:			L('tabTitleTerrain'),
			icon:			Ti.App.Android.R.drawable.tab_icon_terrain_ab_hessentag
    	},
    	
    	parkingTab: {
    		title:			L('tabTitleParking'),
			icon:			Ti.App.Android.R.drawable.tab_icon_parking_ab_hessentag
    	}
    };
    
	
	// weather window
	this.weatherWindow = {
		
		window: Tools.merge({
			
			title:				L('windowTitleWeather'),
			
			backgroundColor:	'transparent',
			backgroundImage:	'transparent',
			
			layout:				'vertical',
			
			backgroundGradient: {
		        
		        type:		'linear',
		        
		        startPoint:	{x: '0%', y: '0%'},
		        endPoint:	{x: '0%', y: '100%'},
		        
		        colors:		[{color: '#406fa4', offset: 0.0}, {color: '#a0c4ee', offset: 1.0}]
		   	}
			
		}, this.window),
		
		loadingBarContainer: this.loadingBarContainer,
		loadingBar: this.loadingBar
	};
	
	
	// weather view
	this.weatherView = {

		view: {
			
			width:		Ti.UI.FILL,
			height:		Ti.UI.FILL,
			
			top:		33,
			left:		57,
			right:		57,
			
			opacity:	0.0,
			
			layout:		'vertical'
		},
		
		city: {
			
			text:		'Bensheim',
			
			width:		Ti.UI.FILL,
			height:		Ti.UI.SIZE,
			
			bottom:		4,
			
			textAlign:	Ti.UI.TEXT_ALIGNMENT_CENTER,
			color:		'#fff',
			font: {
				fontSize: 36
			}
		},
		
		description: {
			
			text:		'leicht bewölkt',
			
			width:		Ti.UI.FILL,
			height:		Ti.UI.SIZE,
			
			bottom:		10,
			
			textAlign:	Ti.UI.TEXT_ALIGNMENT_CENTER,
			color:		'#fff'
		},
		
		temprature: {
			
			text:		'24°',
			
			width:		Ti.UI.FILL,
			height:		Ti.UI.SIZE,
			
			bottom:		(Tools.is4InchIPhone ? 36 : 24),
			
			textAlign:	Ti.UI.TEXT_ALIGNMENT_CENTER,
			color:		'#fff',
			font: {
				fontSize: 76
			}
		},
		
		windDirection: {
			
			image:					'/images/weather/ic_icon_wind_direction.png',
			preventDefaultImage:	true,
			
			width:					Ti.UI.SIZE,
			height:					Ti.UI.SIZE,
			
			transform:				Ti.UI.create2DMatrix({rotate: 300})
		},
		
		forecastContainer: {
			
			width:	Ti.UI.FILL,
			height:	Ti.UI.SIZE,
			
			top:	32,
			
			layout:	'horizontal'
		},
		
		forecast: {
			
			view: {
				
				width:		'33%',
				height:		Ti.UI.SIZE,
				
				layout:		'vertical'
			},
			
			day: {
				
				text:'Mi.',
				
				bottom:	6,
				color:	'#fff'
			},
			
			temprature: {
				
				bottom:	8,
				color:	'#dbebff'
			},
			
			icon: {
				image:					'/assets/images/weather/icon_cloud.png',
				
				preventDefaultImage:	true,
				
				width:					Ti.UI.SIZE,
				height:					Ti.UI.SIZE
			}
		}
	};
	
	
	// help window
	this.helpWindow = {
		
		window: Tools.merge({
			
			title:	L('windowTitleHelp'),
			layout:	'vertical'
			
		}, this.window),
		
		loadingBarContainer: this.loadingBarContainer,
		loadingBar: this.loadingBar,
		
		view: {
			
			filterAttribute:		'searchKeyword',
			hideSearchOnSelection:	false,
						
			width:					Ti.UI.FILL,
			height:					Ti.UI.FILL,
			top:					0,
			
			backgroundColor:		'transparent',
	        separatorColor:			this.tableView.separatorColor
		},
		
		searchBar: {
			
			hintText:			L('searchBarHintTextDefault'),
			
			barColor:			'#d5d5d9',
			backgroundColor:	'#d5d5d9',
			
			borderColor:		'#d0d0d4'
		},
		
		row: {
			
			color: '#000000'
		},
		
		loadingRow: {
			
			row: {
				
				height: 		(Tools.deviceHeight - Tools.getAndroidStatusbarHeight() - 50),
	    		className:		this.loadingRow.className
			},
			
			loadingSpinner: this.loadingSpinner
		},
		
		questionSelectionListView: {
			
			question: {
				
				width:		Ti.UI.FILL,
				height:		Ti.UI.SIZE,
				
				wordWrap:	true,
				ellipsize:	true,
				
				top:		10,
				left:		10,
				right:		10,
				bottom:		10
			}
		}
	};
	
	
	// map view
	this.mapView = {
		
		view: {
			
			width:				Ti.UI.FILL,
			height:				Ti.UI.FILL,
			
			backgroundColor:	'transparent'	
		}
	};
	
	
	// image map view
	this.imageMapView = {
		
		view: {
			contentWidth:					'auto',
			contentHeight:					'auto',
			
			showVerticalScrollIndicator:	false,
			showHorizontalScrollIndicator:	false,
			
			top:							0,
			bottom:							0,
			
			maxZoomValue:					2,
			minZoomValue:					0.5
		},
		
		container: {
			width:			'auto',
			height:			'auto',
			
			touchEnabled: 	false //important
		},
		
		map: {
			width:			'auto',
			height:			'auto',
			
			preventDefaultImage:	true,
			touchEnabled: 			false //important
		},
		
		markerLayer: {
			width:			'auto',
			height:			'auto',
			
			touchEnabled:	false //important
		},
		
		marker: {
			
			width:		28,
			height:		35,
			opacity:	0,
			
			transform:	Ti.UI.create2DMatrix({
				scale: 0.1
			})	
		},
		
		markerIcon: {
			
			pinImage:			'/assets/images/terrain/icon_map_pin.png',
			
			touchEnabled:		false,
		
			width:				25,
			height:				25,
			
			top:				5,
			right:				5,
			bottom:				5,
			left:				5			
		}
	};
	
	
	// arrial window
	this.arrivalWindow = {
		
		window: Tools.merge({
			
			title:	L('windowTitleArrival'),
			
		}, this.window),
		
		view: {
			
			width:					Ti.UI.FILL,
			height:					Ti.UI.SIZE,
			top:					0,
			
			backgroundColor:		'transparent',
	        separatorColor:			this.tableView.separatorColor
		},
		
		row: {
			
			color: '#000000'
		},
		
		rowTitle: {
			
			width:		Ti.UI.FILL,
			height:		Ti.UI.SIZE,
			
			wordWrap:	true,
			ellipsize:	true,
			
			top:		10,
			left:		10,
			right:		10,
			bottom:		10,
			
			color:		'#000000'
		},
		
		loadingRow: {
			
			row: {
				
				height: 		(Tools.deviceHeight - Tools.getAndroidStatusbarHeight() - 50),
	    		className:		this.loadingRow.className
			},
			
			loadingSpinner: this.loadingSpinner
		}
	};
	
	
	// news RSS view
	this.journalListView = {
		
		containerView: {
			
			width:	Ti.UI.FILL,
			height:	Ti.UI.FILL,
			
			layout:	'vertical'
		},
		
		headerImage: {
			
			width:	Tools.deviceWidth,
			height:	45,
			
			top:	1
		},
		
		loadingBarContainer: this.loadingBarContainer,
		loadingBar: this.loadingBar,
		
		view: {
			width:				Ti.UI.FILL,
	        height:				Ti.UI.FILL,
			
			top:				0,
			
	        backgroundColor:	'transparent',
	        separatorColor:		this.tableView.separatorColor
		},
		
		pullToRefreshHeader: {
    	
    		message: 	L('pullToRefreshHeaderMessageTidingsView'),
			textColor:	this.pullToRefreshHeader.textColor
   		},
		
		feedItem: {
			
			row: {
				className: 'journal'
			},
			
			containerBox: {
				
				top: 	10,
				left:	10,
				bottom:	10,
				
				width:	Ti.UI.FILL,
				height:	69,
				
				layout:	'horizontal'
			},
			
			image: {
				
				preventDefaultImage:	true,
				
				width:					69,
				height:					69,
				
				right:					12,
				
				backgroundColor:		this.imageView.backgroundColor,
				borderColor:			'#c8c7cc'
			},
			
			descriptionBox: {
				
				height:	69,
				layout:	'vertical'
			},
			
			title: {
				
				height:		18,
				top:		5,
					
				ellipsize:	true,
				color:		this.titleColor,
				font: {
					
					fontWeight:	'bold',
					fontSize: 	14
				}
			},
			
			date: {
					
				color:	this.textColor,
				font:	{
					
					fontSize: 12
				},
				
				height:	16,
				top:	4
			},
			
			subtitle: {
					
				height:		16,
				top:		2,
				
				ellipsize:	true,
				textAlign:	Ti.UI.TEXT_ALIGNMENT_LEFT,
				color:		this.textColor,
				font: {
					
					fontSize: 12
				}
			}
		},
		
		loadingRow: {
			
			row: {
				
				height: 		(Tools.deviceHeight - Tools.getAndroidStatusbarHeight() - 100 - 45),
	    		className:		this.loadingRow.className
			},
			
			loadingSpinner: this.loadingSpinner 
		}
	};
	
	
	// home view
	var shortCutWidth =		Math.floor((Tools.deviceWidth - 15) / 2),
		eventBannerHeight =	Math.floor((Tools.deviceHeight - Tools.getAndroidStatusbarHeight() - 20 - 48 - 140) / 2);
	
	this.homeView = {
		
		container: {
			
			width:				Ti.UI.FILL,
			height:				Ti.UI.FILL,
			top:				0,
			
			layout:				'vertical',
			backgroundColor:	'#e6e6eb'
		},
		
		topEventContainer: {
			
			height: eventBannerHeight,
			top:	5,
			left:	5,
			right:	5
		},
		
		bottomEventContainer: {
			
			height: eventBannerHeight,
			top:	5,
			left:	5,
			right:	5
		},
		
		loadingSpinner: Tools.combine(this.loadingSpinner, {
			
			style:	Ti.UI.ActivityIndicatorStyle.DARK
		}),
		
		shortCutContainer: {
			
			height:	Ti.UI.SIZE,
			
			top:	5,
			left:	5,
			right:	5,
			
			layout:	'horizontal'
		},
		
		leftShortCut: {
			
			view: {
				
				width:	shortCutWidth,
				height:	140,
				left:	0,
				
				backgroundGradient: {
			        
			        type:		'linear',
			        
			        startPoint:	{x: '0%', y: '0%'},
			        endPoint:	{x: '0%', y: '100%'},
			        
			        colors:		[{color: '#0c4079', offset: 0.0}, {color: '#124291', offset: 1.0}]
			   	}	
			},
			
			button: {
				
				image:				'/images/home/ic_icon_social_shortcut.png',
				
				backgroundImage:	'transparent',
				backgroundColor:	'transparent'
			}		
		},
		
		rightShortCut: {
			
			view: {
				
				width:	shortCutWidth,
				height:	140,
				left:	5,
				
				backgroundGradient: {
			        
			        type:		'linear',
			        
			        startPoint:	{x: '0%', y: '0%'},
			        endPoint:	{x: '0%', y: '100%'},
			        
			        colors:		[{color: '#406fa4', offset: 0.0}, {color: '#a0c4ee', offset: 1.0}]
			   	}				
			},
			
			button: {
				
				opacity:		0.0,
				
				textAlign:		Ti.UI.TEXT_ALIGNMENT_CENTER,
				color:			'#fff',
				font: {
					fontSize: 42
				},
				
				image:			'',
				title:			'',
				
				noDataImage:	'/images/home/ic_icon_weather_shortcut.png'
			}	
		}
	};
	
	
	this.eventBannerView = {
		
		view: {
		
			width:		Ti.UI.FILL,
			height:		Ti.UI.FILL
		},
		
		loadingBar: {
			
			width:				Ti.UI.FILL,
			height:				6,
			
			bottom:				40,
			color: 				'#c8d200',
			
			sectionsCount: 		6,
			separatorLength:	8,
			strokeWidth:		6,
			
			speed: 				1,
			interpolator: 		3
		},
		
		image: {
			
			width:					(Tools.deviceWidth - 10),
			height:					eventBannerHeight,
			preventDefaultImage:	true
		},
		
		titleContainer: {
			
			width:				Ti.UI.FILL,
			height:				40,
			bottom:				0,
			
			backgroundColor:	'#CC0c4079',
		},
		
		title: {
			
			height:				Ti.UI.SIZE,
			left:				10,
			right:				10,
			
			
			textAlign:			Ti.UI.TEXT_ALIGNMENT_LEFT,
			color:				'#ffffff',
			font: {
				fontSize:	12
			}
		}
	};
	
	
	// return all these objects
	return this;
   
} // END Stylesheet()


// Provide public access to CommonJS module
module.exports = Stylesheet;
