/*
 * ViewPager.js
 *
 * /Resources/ui/common/default/ViewPager.js
 *
 * This module represents a cross-platform Android ViewPager module
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
 * ViewPagerTab
 *
 * @constructor
 * @param {Map/Dictonary} args
 * @return {ViewPagerTab} this
 */
function ViewPagerTab(args) {

	// load toolbox
	var Tools = require('/helpers/common/tools');


	// variable declaration
	this.options =		args;
	this.index =		this.options.tabIndex;
	this.isSelected =	false;

	// protect context
	var that = this;


	// create container view
	this.viewProxy = Ti.UI.createView({

		tabIndex:			this.options.tabIndex,

		width:				this.options.tabWidth,
		height:				this.options.tabHeight,

		backgroundColor:	this.options.tabBackgroundColor
	});


	// define content width
	var _contentWidth = (Tools.type(this.options.tabWidth) === 'number' ? Ti.UI.FILL : this.options.tabWidth);


	// create tab title
	this.title = Ti.UI.createLabel({

		text:			(this.options.font.fontCase.toUpperCase() === 'UPPER' ? this.options.tabTitle.toUpperCase() : this.options.tabTitle),

		width:			_contentWidth,
		height:			(this.options.font.fontSize + 4),

		left:			this.options.padding.paddingLeft,
		right:			this.options.padding.paddingRight,

		touchEnabled:	false,

		textAlign:		Ti.UI.TEXT_ALIGNMENT_CENTER,
		color:			this.options.font.fontColor,
		font: {

			fontSize:	this.options.font.fontSize,
			fontFamily:	this.options.font.fontFamily,
			fontWeight:	this.options.font.fontWeight,
			fontStyle:	this.options.font.fontStyle
		}
	});


	// add title event listener
	this.title.addEventListener('postlayout', _afterTitleLayout);


	// create tab indicator line
	this.indicator = Ti.UI.createView({

		height:				this.options.lineHeight,

		left:				(Tools.isAndroid ? 0 : this.options.padding.paddingLeft),
		right:				(Tools.isAndroid ? 0 : this.options.padding.paddingRight),
		bottom:				0,

		backgroundColor:	this.options.lineColor,
		touchEnabled:		false,
		visible:			false
	});


	// add title and indicator to container view
	this.viewProxy.add(this.title);
	this.viewProxy.add(this.indicator);


	/**
	 * Title postlayout callbacl
	 *
	 * @private
	 * @method _afterTitleLayout
	 * @param {Object} postlayoutEvent
	 * @return void
	 */
	function _afterTitleLayout(postlayoutEvent) {

		// remove this event listener
		this.removeEventListener('postlayout', _afterTitleLayout);


		// set indicator width to same as title width
		if (require('/helpers/common/tools').isAndroid) {

			that.indicator.setWidth(this.getSize().width + that.options.padding.paddingLeft + that.options.padding.paddingRight);
		}
		else {

			that.indicator.setWidth(this.getSize().width);
		}

		that.indicator.setVisible(true);


		return;

	} // END _afterTitleLayout()


	return this;

} // END ViewPagerTab()


/**
 * Selects this tab
 *
 * @public
 * @method select
 * @return void
 */
ViewPagerTab.prototype.select = function() {

	if (!this.isSelected) {

		this.viewProxy.setBackgroundColor(this.options.tabBackgroundColorSelected);
		this.title.setColor(this.options.font.fontColorSelected);
		this.indicator.setBackgroundColor(this.options.lineColorSelected);

		this.isSelected = true;
	}

	return;

}; // END select()


/**
 * Deselects this tab
 *
 * @public
 * @method deselect
 * @return void
 */
ViewPagerTab.prototype.deselect = function() {

	if (this.isSelected === true) {

		this.viewProxy.setBackgroundColor(this.options.tabBackgroundColor);
		this.title.setColor(this.options.font.fontColor);
		this.indicator.setBackgroundColor(this.options.lineColor);

		this.isSelected = false;
	}

	return;

}; // END deselect()



var TAB_TYPE_NONE =		0,
	TAB_TYPE_NORMAL =	1,
	TAB_TYPE_SCROLL =	2,

	SWIPE_DIRECTION_LEFT = 'left',
	SWIPE_DIRECTION_RIGHT = 'right',
	SWIPE_DIRECTION_NONE = 'none';


/**
 * ViewPager
 *
 * @constructor
 * @param {Map/Dictonary} args
 * @return {ViewPager} this
 */
function ViewPager(args) {

	// load toolbox
	var Tools = require('/helpers/common/tools');


	// merge defaults and params
	var _options = Tools.merge({

        pages:			[],
        currentPage:	0,

        tabs: {

        	type:						TAB_TYPE_NORMAL, // @see exports.TAB_TYPE... at bottom of file

        	backgroundColor:			'transparent',

	        tabBackgroundColor:			'transparent',
	        tabBackgroundColorSelected:	'transparent',

	        lineColor:					'transparent',
	        lineColorSelected:			'#000000',

	        lineHeight:					6,

	        font: {

	            fontSize:			14,
	            fontColor:			'#000000',
	            fontColorSelected:	'#000000',
	            fontFamily:			'Helvetica',
	            fontWeight:			'normal',
	            fontStyle:			'normal',
	            fontCase:			'normal'
	        },

	        padding: {

	            paddingLeft:		20,
	            paddingRight:		20
	        }
        }

    }, args);


    // variable declaration
	var _tabCount = _options.pages.length,
	    _tabHeight = 47,
	    _tabWidths = [],
	    _tabWidth, _tabContainerWidth, _tabContainerContentWidth;


    this.scrollableViews =	[];
	this.tabs =				[];
	this.lastActivePage =	_options.currentPage;


	// protect context
	var that = this;


	// create container view
	this.viewProxy = Ti.UI.createView({
		layout:	'vertical'
	});


	// create tab container
	var _tabContainer = Ti.UI.createScrollView({

		width:  Ti.UI.FILL,
		height: 47,

		top: 0,

		contentWidth:  'auto',
		contentHeight: 'auto',

		scrollType: 'horizontal',
		layout:     'horizontal',

		disableBounce:                 true,
		showHorizontalScrollIndicator: false,
		showVerticalScrollIndicator:   false,
		scrollsToTop:                  false,
		backgroundColor:               _options.tabs.backgroundColor
	});


    // collect scrollable views
    _options.pages.forEach(function(page) {

		that.scrollableViews.push(page.view);
    });


    // create scrollable view
    this.scrollableView = Ti.UI.createScrollableView({

		views:					that.scrollableViews,

		currentPage:			_options.currentPage,
		showPagingControl:      false,
        disableBounce:			true,

		top:					0,

        backgroundColor:        'transparent',
        backgroundImage:        'transparent'
    });


    this.scrollableView.addEventListener('scrollend', function(scrollendEvent) {

        // fetch current tab/page/view index
        var currentPage = scrollendEvent.currentPage;


        // sync active/inactive tab UI states
        if (require('/helpers/common/tools').type(currentPage) === 'number' && currentPage > -1) {

	        // adjust tab indicator position and tab positions
	        _syncActiveTabs(currentPage, that.lastActivePage);


	        // fire appropriate events
			var currentPageView =	that.scrollableViews[currentPage],
				lastPageView =		that.scrollableViews[that.lastActivePage];

			that.lastActivePage = currentPage;


			lastPageView.fireEvent('viewPagerInactive', {tab: that.tabs[that.lastActivePage].options.tabTitle});
			currentPageView.fireEvent('viewPagerActive', {tab: that.tabs[currentPage].options.tabTitle});


	        // fire tab changed event
	        that.fireEvent('viewPagerTabChanged', {

		        index:	currentPage,
		        tab:	that.tabs[currentPage],
		        view:	currentPageView
	        });
        }


        return;
	});


	// add postlayout event to fire event on first load to first view
	this.scrollableView.addEventListener('postlayout', _afterScrollableViewLayout);


    // determine tab count and width
	switch (_options.tabs.type) {

		case TAB_TYPE_NORMAL:

			_tabWidth = (Tools.deviceWidth / _tabCount);
			break;

		case TAB_TYPE_SCROLL:

			_tabWidth = Ti.UI.SIZE;
			break;

		default:

			_tabWidth = Ti.UI.SIZE;
			break;
	}


    // create and add tabs
    _options.pages.forEach(function(page, index) {

		var tab = new ViewPagerTab(require('/helpers/common/tools').merge({

			tabTitle:  page.title,
			tabIndex:  index,
			tabWidth:  _tabWidth,
			tabHeight: _tabHeight,
			tabCount:  _tabCount

		}, _options.tabs));


		// adjust images and scroll ScrollableView on tab bar clicks
        tab.viewProxy.addEventListener('click', function(tabClickEvent) {

			that.scrollableView.scrollToView(this.tabIndex);


			return;
        });


        // add tab to tab container and reference array
        _tabContainer.add(tab.viewProxy);
		that.tabs.push(tab);


		// select initial tab
		if (index === _options.currentPage) {

			tab.select();
		}

		return;
    });


    // only add tab container if tabs are should be visible
    if (_tabCount > 0 && _options.tabs.type !== TAB_TYPE_NONE) {

		this.viewProxy.add(_tabContainer);
    }


    // add scrollable view to view proxy
    this.viewProxy.add(this.scrollableView);


    /**
     * Postlayout callback for scrollable view - Due to fire
     * active event to first visible tab/view
     *
     * @private
     * @method _afterScrollableViewLayout
     * @param {Object} afterLayoutEvent
     * @return void
     */
    function _afterScrollableViewLayout(afterLayoutEvent) {

    	// remove event listener
    	this.removeEventListener('postlayout', _afterScrollableViewLayout);


    	// fetch current tab/page/view index
        var currentPage = this.getCurrentPage();


    	// sync active/inactive tab UI states
        if (require('/helpers/common/tools').type(currentPage) === 'number' && currentPage > -1) {

			that.scrollableViews[currentPage].fireEvent('viewPagerActive', {tab: that.tabs[currentPage].options.tabTitle});
        }

    	return;

    } // END _afterScrollableViewLayout()


    /**
     * Marks active tab as active and unselect all
     * unactive tabs
     *
     * @private
     * @method _syncActiveTabs
     * @param {Number} currentTabIndex
     * @param {Number} lastTabIndex
     * @return void
     */
    function _syncActiveTabs(currentTabIndex, lastTabIndex) {

	    // variable declaration
	    var Tools = require('/helpers/common/tools'),
	        swipeDirection = SWIPE_DIRECTION_LEFT,
	        nextTabIndex, nextVisibleTab, nextVisibleTabWidth, xValue;


		// fetch all tab widths and tab container content width if not already done
		if (!_tabWidths.length) {

			_tabWidths = that.tabs.map(function(tab) {

				return ((tab && tab.viewProxy && tab.viewProxy.getRect().width) || (tab.getRect && tab.getRect().width));
			});

			_tabContainerWidth =		_tabContainer.getSize().width;
			_tabContainerContentWidth =	_tabWidths.reduce(_computeTabWidthSum);
		}


		// if tabs type scroll, scroll next tab into viewport
		if (_options.tabs.type === TAB_TYPE_SCROLL) {

			// fetch next tab index, next tab object and next visible tab width
			if (lastTabIndex > currentTabIndex) {

				nextTabIndex = (currentTabIndex > 0 ? currentTabIndex - 1 : currentTabIndex);
			}
			else {

				swipeDirection = SWIPE_DIRECTION_RIGHT;

				nextTabIndex = (currentTabIndex + 1 >= _tabCount ? currentTabIndex : currentTabIndex + 1);
			}


			// fetch next tab object and next tab width
			nextVisibleTab = that.tabs[nextTabIndex];
			nextVisibleTabWidth = _tabWidths[nextTabIndex];


			// calculate new x offset
			switch (swipeDirection) {

				case SWIPE_DIRECTION_LEFT:

					xValue = Math.min((_tabContainerContentWidth - _tabContainerWidth), nextVisibleTab.viewProxy.getRect().x);
					break;


				case SWIPE_DIRECTION_RIGHT:

					xValue = Math.max(0, (nextVisibleTab.viewProxy.getRect().x + nextVisibleTabWidth - _tabContainerWidth));
					break;
			}


			// if given scroll to new calculate x offset
			Tools.type(xValue) === 'number' && _tabContainer.scrollTo((Tools.isAndroid ? Ti.UI.convertUnits(xValue, Ti.UI.UNIT_PX) : xValue), 0);
		}


		// setup active/inactive state
		if (currentTabIndex !== lastTabIndex) {

			that.tabs[lastTabIndex].deselect();
			that.tabs[currentTabIndex].select();
		}


	    // GC
	    Tools = null;


		return;

    } // END _syncActiveTabs()


    /**
     * Computes the sum of tab widths
     *
     * @private
     * @method _computeTabWidthSum
     * @param {Number} previousValue
     * @param {Number} currentValue
     * @param {Number} arrayIndex
     * @param {Array} tabWidthArray
     * @return {Number}
     */
	function _computeTabWidthSum(previousValue, currentValue, arrayIndex, tabWidthArray) {

		return (previousValue + currentValue);

	} // END _computeTabWidthSum()


    return this;

} // END ViewPager()


/**
 * Returns the current tab position
 *
 * @public
 * @method getCurrentTab
 * @return {Number} currentTabPosition
 */
ViewPager.prototype.getCurrentTab = function() {

	var currentTabPosition = -1;

	if (this.scrollableView) {
		currentTabPosition = this.scrollableView.getCurrentPage();
	}

	return currentTabPosition;

}; // END getCurrentTab()


/**
 * Fires event
 *
 * @public
 * @method fireEvent
 * @param {String} eventName
 * @return void
 */
ViewPager.prototype.fireEvent = function(eventName) {

	(require('/helpers/common/tools').type(eventName) === 'string' && eventName.length && this.viewProxy.fireEvent(eventName));

	return;

}; // END fireEvent()


/**
 * Add event listener
 *
 * @public
 * @method addEventListener
 * @param {String} eventName
 * @param {Function} eventCallback
 * @return void
 */
ViewPager.prototype.addEventListener = function(eventName, eventCallback) {

	(eventName && eventName.length && eventCallback && this.viewProxy.addEventListener(eventName, eventCallback));

	return;

}; // END addEventListener()


/**
 * Remove event listener
 *
 * @public
 * @method removeEventListener
 * @param {String} eventName
 * @param {Function} eventCallback
 * @return void
 */
ViewPager.prototype.removeEventListener = function(eventName, eventCallback) {

	(eventName && eventName.length && eventCallback && this.viewProxy.removeEventListener(eventName, eventCallback));

	return;

}; // END removeEventListener()




// CONSTANTS
exports.TAB_TYPE_NONE = TAB_TYPE_NONE;
exports.TAB_TYPE_NORMAL = TAB_TYPE_NORMAL;
exports.TAB_TYPE_SCROLL = TAB_TYPE_SCROLL;

exports.SWIPE_DIRECTION_LEFT = SWIPE_DIRECTION_LEFT;
exports.SWIPE_DIRECTION_RIGHT = SWIPE_DIRECTION_RIGHT;
exports.SWIPE_DIRECTION_NONE = SWIPE_DIRECTION_NONE;


/**
 * Creates an new ViewPager instance
 *
 * @public
 * @method createViewPager
 * @param {Object} args
 * @return {ViewPager}
 */
exports.createViewPager = function(args) {

	return new ViewPager(args);

}; // END createViewPager()
