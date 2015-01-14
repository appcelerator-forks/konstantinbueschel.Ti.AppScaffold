/*
 * ListView.js
 *
 * /Resources/ui/common/android/ListView.js
 *
 * This module represents the default list view with PullToRefresh and Infinite Scroll
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
 * ListView
 *
 * @constructor
 * @param {Map/Dictonary} args
 * @return {ListView} this
 */
function ListView(args) {

	// import the stylesheet and load required modules
    var Stylesheet =	require('/ui/Stylesheet'),
		Tools =			require('/helpers/common/tools'),

		_styles =		new Stylesheet();

	this.stylesheet =	_styles.init();


	// merge options
	this.options = Tools.merge({

		activatePullToRefresh:        true,
		activateInfiniteScroll:       true,
		activateNetworkNotifications: true,

		emptyView: undefined,
		dataURL:   undefined

	}, args);


	// variable initialization
	this._isInitialzed = false;
	this._pullToRefreshAttached = false;
	this._infiniteSteps = 10;
	this._infiniteOffset = 0;
	this._passingRows;

	this.isFetchingData = false;
	this.rows = [];

	var _sp = 0,
	    _lastScrollPosition,
	    _androidMenu = this.options.menu,
		self = this;

	delete this.options.menu;


	// setup Android menu
	if (_androidMenu) {

		var Globals = require('/helpers/common/globals');

		_androidMenu.add({

			icon:        '/images/icons/common/ic_action_navigation_refresh.png',
			itemId:       Globals.menu.Android.ITEM_ID_REFRESH,
			groupId:      Globals.menu.Android.GROUP_ID_VIEW_MENU,
			showAsAction: Ti.Android.SHOW_AS_ACTION_IF_ROOM,

			onClick: function () {

				// dispatch reload
				require('/helpers/app/EventDispatcher').trigger('refreshstart', {

					type: 'refreshstart'
				});
			}
		});


		// GC
		Globals = null;
	}


	// create element container
	this.viewProxy = Ti.UI.createView(this.stylesheet.listView.viewProxy);


	// create listview
    this.listView = Ti.UI.createTableView(this.stylesheet.listView.listView);


	// create indicator for notifications
	var Notification = require('/ui/common/default/Notification');

	this.indicator = new Notification({

		parent: this.viewProxy
	});

	Notification = null;


	// add list view event listener
	this.listView.addEventListener('postlayout', function(afterLayoutEvent) {

		// remove event listener
		this.removeEventListener(afterLayoutEvent.type, arguments.callee);


		// load social media entries
		self.load();


		// add event listener
		this.addEventListener('click', _onListItemSelected);


		// FIXME: Dummy method
		// fire tracking event
		require('/helpers/analytics/ga').screen(L('windowTitleListView'));


		// GC
		_afterLayout = null;


		return;
	});


	/**
	 * List item click callback
	 *
	 * @private
	 * @method _onListItemSelected
	 * @param {Object} selectedEvent
	 * @return void
	 */
	function _onListItemSelected(selectedEvent) {

		var recordData = (selectedEvent && selectedEvent.row && selectedEvent.row.recordData);

		if (recordData) {

			require('/helpers/common/tools').navigateApp({

				// FIXME: Dummy method
				action:				require('/helpers/common/globals').action.EXAMPLE_DETAIL_SCREEN,
				openAsCenterWindow:	false,
				recordData:			recordData
			});
		}


		return;

	} // END _onListItemSelected()


    /**
     * Attaches pull to refresh functionality
     *
     * @private
     * @method _attachPullToRefresh
     * @return void
     */
    this._attachPullToRefresh = function() {

	    if (this.options.activatePullToRefresh === true && !this._pullToRefreshAttached) {

		    // add needed event listener
		    require('/helpers/app/EventDispatcher').on('refreshstart', _onRefreshStart);


		    // update attached state
		    this._pullToRefreshAttached = true;


		    // attach event listener
		    if (this.pullToRefreshControl) {

			    this.pullToRefreshControl.addEventListener('refreshing', _onRefreshStart);
		    }
	    }

	    return;

    }; // END _attachPullToRefresh()


    /**
     * Detaches pull to refresh functionality
     *
     * @private
     * @method _detachPullToRefresh
     * @return void
     */
    this._detachPullToRefresh = function() {

	    if (this.options.activatePullToRefresh === true && this._pullToRefreshAttached) {

		    // remove event listener
		    require('/helpers/app/EventDispatcher').off('refreshstart', _onRefreshStart);


		    // update attached state
		    this._pullToRefreshAttached = false;


		    // detach event listener
		    if (this.pullToRefreshControl) {

			    this.pullToRefreshControl.removeEventListener('refreshing', _onRefreshStart);
		    }
	    }

	    return;

    }; // END _detachPullToRefresh()


	/**
	 * On pull to refresh header refresh start callback
	 *
	 * @private
	 * @method _onRefreshStart
	 * @param {Object} refreshStartEvent
	 * @return void
	 */
	function _onRefreshStart(refreshStartEvent) {

		if (refreshStartEvent.type === 'refreshstart') {

			// save current row state if
			// refresh fails
			if (self.rows.length) {

				self._passingRows = self.rows.slice();
			}


			self.rows.length = 0;
			self.load();
		}
		else {

			// Hack: if pull to refresh is detached stops refreshing
			// immediately, cause a detachment of the SwipeToRefreshLayout
			// is not possible
			if (self.options.activatePullToRefresh === true
				&& self._pullToRefreshAttached === false) {

				if (self.pullToRefreshControl && self.pullToRefreshControl.isRefreshing()) {

					self.pullToRefreshControl.setRefreshing(false);
				}

				return;
			}


			// load data if not already fetching
			if (self.isFetchingData === false) {

				// load data
				self._doRefresh();
			}
			// else stops refreshing indicator
			else if (self.pullToRefreshControl && self.pullToRefreshControl.isRefreshing()) {

				self.pullToRefreshControl.setRefreshing(false);
			}
		}


		return;

	} // END _onRefreshStart()


	/**
     * Attaches infinite scroll functionality
     *
     * @private
     * @method _attachInfiniteScroll
     * @return void
     */
    this._attachInfiniteScroll = function() {

	    if (this.options.activateInfiniteScroll) {

		    // adding list view event listener
		    this.listView.addEventListener('scroll', _onScrolling);
	    }

    	return;

    }; // END _attachInfiniteScroll()


    /**
     * Detaches infinite scroll functionality
     *
     * @private
     * @method _detachInfiniteScroll
     * @return void
     */
    this._detachInfiniteScroll = function() {

    	// remove list view event listener
    	this.listView.removeEventListener('scroll', _onScrolling);

    	return;

    }; // END _detachInfiniteScroll()


    /**
	 * list view scroll callback
	 *
	 * @private
	 * @method _onScrolling
	 * @param {Object} scrollEvent
	 * @return void
	 */
	function _onScrolling(scrollEvent) {

	    if (scrollEvent.source !== self.listView) {

		    return;
	    }


	    _sp = scrollEvent.firstVisibleItem;
	    scrollEvent.cancelBubble = true;


		// going down is the only time we dynamically load,
		// going up we can safely ignore
	    if (!self.isFetchingData
		        && self.rows.length
		            && _lastScrollPosition
		                && scrollEvent.firstVisibleItem >= _lastScrollPosition
		                    && scrollEvent.totalItemCount <= (scrollEvent.firstVisibleItem + scrollEvent.visibleItemCount)) {


            // load more data
	        self._doNext(undefined, self._infiniteOffset + self._infiniteSteps);
		}

	    _lastScrollPosition = scrollEvent.firstVisibleItem;


	    return;

	} // END _onScrolling()


	/**
	 * Activate network change notifications
	 *
	 * @private
	 * @method _activateNetworkNotifications
	 * @return void
	 */
	this._activateNetworkNotifications = function() {

		if (this.options.activateNetworkNotifications) {

			require('/helpers/app/EventDispatcher').on('app:networkChange', _handleNetworkChanges);
		}

		return;

	}; // END _activateNetworkNotifications()


	/**
	 * Disables network change notifications
	 *
	 * @private
	 * @method _disableNetworkNotifications
	 * @return void
	 */
	this._disableNetworkNotifications = function() {

		require('/helpers/app/EventDispatcher').off('app:networkChange', _handleNetworkChanges);

		return;

	}; // END _disableNetworkNotifications()


	/**
	 * Handles network change events
	 *
	 * @private
	 * @method _handleNetworkChanges
	 * @param {Object} networkChangeEvent
	 * @return void
	 */
	function _handleNetworkChanges(networkChangeEvent) {

		if (networkChangeEvent.online && !self.rows.length) {

			// enable infinite scroll
			self._attachInfiniteScroll();

			self.load();
		}

		return;

	} // END _handleNetworkChanges()


	// create pull to refresh layout and attach it
	if (this.options.activatePullToRefresh === true) {

		var PullToRefreshLayout = require('com.rkam.swiperefreshlayout');

		this.pullToRefreshControl = PullToRefreshLayout.createSwipeRefresh({

			view: this.listView,

			width:  Ti.UI.FILL,
			height: Ti.UI.FILL
		});

		this.viewProxy.add(this.pullToRefreshControl);

		this._attachPullToRefresh();


		// GC
		PullToRefreshLayout = null;
	}
	else {

		this.viewProxy.add(this.listView);
	}


	// activate network notification changes if required
	this._activateNetworkNotifications();


	// attach infinite scrolling if required
	this._attachInfiniteScroll();


	return this;

} // END ListView()


/**
 * Add loading spinner row to the end of list view
 *
 * @private
 * @method _attachLoadingWidget
 * @return void
 */
ListView.prototype._attachLoadingWidget = function() {

	// check if loading row is already shown
	var rowCount = this.rows.length;

	if (rowCount && this.rows[rowCount - 1].className === 'loadingWidget') {

		return;
	}


	// create loading row
	var loadingRowStyles = this.stylesheet.listView.loadingWidget,

	    loadingRow = Ti.UI.createTableViewRow(loadingRowStyles.row),
	    loadingSpinner = Ti.UI.createActivityIndicator(loadingRowStyles.loadingSpinner);


	loadingRow.add(loadingSpinner);
	loadingSpinner.show();


	// add loading row to the rows array
	this.rows.push(loadingRow);


	// add loading row to table view
	this.listView.appendRow(loadingRow);


	// GC
	rowCount = null;
	loadingRowStyles = null;
	loadingRow = null;
	loadingSpinner = null;

    return;

}; // END _attachLoadingWidget()


/**
 * Removes loading spinner row from the end of list view
 *
 * @private
 * @method _detachLoadingWidget
 * @return void
 */
ListView.prototype._detachLoadingWidget = function() {

	// check if loading row is already shown
	var lastRow = this.rows.pop();

	if (lastRow && lastRow.className === 'loadingWidget') {

		this.listView.deleteRow(lastRow);

		lastRow = null;
	}

	return;

}; // END _detachLoadingWidget()


/**
 * Pass an array of row objects to update list view
 *
 * @public
 * @method updateData
 * @param {Dictonary[]} rowData
 * @return void
 */
ListView.prototype.updateData = function(rowData) {

	// abort process if no arguments given
	if (!rowData) {

		return;
	}


	// create rows
	var rows = this.createRows(rowData);


	// remove loading widget
	this._detachLoadingWidget();


	// concat rows array with new data
	this.rows = this.rows.concat(rows);


	// stop pull to refresh
	if (this.pullToRefreshControl && this.pullToRefreshControl.isRefreshing()) {

		this.pullToRefreshControl.setRefreshing(false);
	}


	// append new rows
	if (rows.length) {

		this.listView.appendRow(rows);
	}


	// shows up emptyView if no rows given
	if (!this.rows.length) {

		this._showEmptyView();
	}

	return;

}; // END updateData()


/**
 * Populates list view with rows
 *
 * @public
 * @method populate
 * @param {Array} rowData
 * @return void
 */
ListView.prototype.populate = function(rowData) {

	if (require('/helpers/common/tools').type(rowData) === 'array' && rowData.length) {

		// create rows
		this.rows = this.createRows(rowData);


		// stop pull to refresh indicator
		if (this.pullToRefreshControl && this.pullToRefreshControl.isRefreshing()) {

			this.pullToRefreshControl.setRefreshing(false);
		}


		// set new rows
		this.listView.setData(this.rows);
	}
	else {

		this.hideLoadingRow();
	}


	// shows up emptyView if no rows given
	if (!this.rows.length) {

		this._showEmptyView();
	}

	return;

}; // END populate()


/**
 * Shows up empty view if no rows given
 *
 * @private
 * @method _showEmptyView
 * @return void
 */
ListView.prototype._showEmptyView = function() {

	if (!this.isFetchingData && !this.rows.length && this.options.emptyView) {

		// create loading row
		var noDataRow = Ti.UI.createTableViewRow(this.stylesheet.listView.noDataRow.row);

		noDataRow.add(this.options.emptyView);


		// replace list view data with loading row
		this.listView.setData([noDataRow]);


		noDataRow = null;
	}

	return;

}; // END _showEmptyView()


/**
 * Displays one list view filled row with
 * a loading indicator in it
 *
 * @public
 * @method showLoadingRow
 * @return void
 */
ListView.prototype.showLoadingRow = function() {

	if (!this.isFetchingData && !this.rows.length) {

		// create loading row
		var loadingRowStyles = this.stylesheet.listView.loadingRow,

		    loadingRow = Ti.UI.createTableViewRow(loadingRowStyles.row),
		    loadingSpinner = Ti.UI.createActivityIndicator(loadingRowStyles.loadingSpinner);

		loadingRow.setHeight(this.listView.getRect().height);

		loadingRow.add(loadingSpinner);


		// replace list view data with loading row
		this.listView.setData([loadingRow]);

		this.rows.push(loadingRow);


		// show loading spinner
		loadingSpinner.show();


		// GC
		loadingRowStyles = null;
		loadingRow = null;
		loadingSpinner = null;
	}

	return;

}; // END showLoadingRow()


/**
 * Hides the loading big view filled loading row
 *
 * @public
 * @method hideLoadingRow
 * @return void
 */
ListView.prototype.hideLoadingRow = function() {

	var lastRow = this.rows.pop();

	if (lastRow.className === 'loading') {

		// delete loading row
		this.listView.deleteRow(lastRow);
	}
	else {

		this.rows.push(lastRow);
	}

	return;

}; // END hideLoadingRow()


/**
 * Creates rows from given data
 *
 * @public
 * @method createRows
 * @param {Array} rowData
 * @return {Ti.UI.TableViewRow[]} rows
 */
ListView.prototype.createRows = function(rowData) {

	var rows =	[],
		Tools =	require('/helpers/common/tools');

	if (Tools.type(rowData) === 'array' && rowData.length) {

		rowData.forEach(function(singleRowData) {

			// create row object
			var row = Ti.UI.createTableViewRow(this.stylesheet.listView.rows.row);

			row.title = singleRowData.title;
			row.recordData = singleRowData;

			rows.push(row);

			row = null;

		}, this);
	}

	return rows;

}; // END createRows()


/**
 * Process rows load
 *
 * @public
 * @method load
 * @param {Function} loadCallback
 * @return void
 */
ListView.prototype.load = function(loadCallback) {

	// display loading row
	this.showLoadingRow();


	// and start loading data
	this._doRefresh(loadCallback);


	return;

}; // END load()


/**
 * Refresh rows
 *
 * @private
 * @method _doRefresh
 * @param {Function} loadCallback
 * @return void
 */
ListView.prototype._doRefresh = function(loadCallback) {

	// process reload/refresh
	if (this.options.dataURL) {

		this._doLoad(loadCallback);
	}

	return;

}; // END _doRefresh()


/**
 * Process more data load
 *
 * @private
 * @method _doNext
 * @param {Function} loadCallback
 * @param {Number} offset
 * @return void
 */
ListView.prototype._doNext = function(loadCallback, offset) {

	this._attachLoadingWidget();
	this._doLoad(loadCallback, offset);


	return;

}; // END _doNext()


/**
 * Load data
 *
 * @private
 * @method _doLoad
 * @param {Function} loadCallback
 * @param {Number} offset
 * @return void
 */
ListView.prototype._doLoad = function(loadCallback, offset) {

	// if currently is fetching data
	if (this.isFetchingData) {

		if (loadCallback) {

			loadCallback(false, {

				code:		209,
				message:	L('errorMessageListViewCurrentlyLoading')
			});
		}

		return;
	}


	// set loading state
	this.isFetchingData = true;


	// display loading row
	this.showLoadingRow();


	// protect context
	var self = this;


	/**
	 * Data fetching done callback
	 *
	 * @private
	 * @method _done
	 * @param {Object} result
	 * @return void
	 */
	function _done(result) {

		result = result.result;


		// execute callback if given
		if (loadCallback) {

			loadCallback(true);
		}


		// short-live notification
		if (self.indicator.isVisible === true) {

			self.indicator.show({

				text:	    L('httpRequestConnected'),
				color:		'#00ff00',
				duration:	1
			});
		}


		// parse data objects
		var resultObjects;

		if (result) {

			switch (require('/helpers/common/tools').type(result.data)) {

				case 'string':

					resultObjects = JSON.parse(result.data);
					break;

				case 'array':

					resultObjects = result.data;
					break;

				case 'object':

					resultObjects = result.data.items;
					break;
			}
		}


		// append to list view
		if (offset) {

			if (resultObjects && resultObjects.length) {

				self._infiniteOffset += self._infiniteSteps;
			}

			self.updateData(resultObjects);

		}
		// populate list view
		else {

			self.populate(resultObjects);
		}


		// stop pull to refresh
		if (self.pullToRefreshControl && self.pullToRefreshControl.isRefreshing()) {

			self.pullToRefreshControl.setRefreshing(false);
		}


		// set loading state
		self.isFetchingData = false;


		// update init state
		self._isInitialzed = true;


		// reset passing rows
		self._passingRows.length = 0;


		return;

	} // END _done()


	/**
	 * Tweet fetching error callback
	 *
	 * @private
	 * @method _fail
	 * @param {Object} failEvent
	 * @return void
	 */
	function _fail(failEvent) {

		// execute callback if given
		if (loadCallback) {

			loadCallback(failEvent.error);
		}

		var requestResult = failEvent.result;


		// stops pull to refresh
		if (self.pullToRefreshControl && self.pullToRefreshControl.isRefreshing()) {

			self.pullToRefreshControl.setRefreshing(false);
		}


		// hide loading widget
		self._detachLoadingWidget();


		// set loading state
		self.isFetchingData = false;


		// add old rows if given
		if (self._passingRows && self._passingRows.length) {

			self.rows = self._passingRows;
			self.listView.setData(self.rows);
		}
		// hide loading row
		else {

			self.hideLoadingRow();
		}


		// error notification
		var notificationOptions = {

			text:   requestResult.error,
			color:  '#ff0000'
		};


		if (require('/helpers/common/tools').hasNetworkConnectivity() || self.rows.length) {

			notificationOptions.duration = 2;
		}
		else if (!require('/helpers/common/tools').hasNetworkConnectivity()) {

			notificationOptions.text = L('httpRequestDisconnected');
		}

		self.indicator.show(notificationOptions);


		return;

	} // END _fail()


	// process data loading
	var dataURL = this.options.dataURL,
	    dataURLType = require('/helpers/common/tools').type(dataURL);


	if (dataURLType === 'string') {

		// show try to connect notification
		if (this.indicator.isVisible === true) {

			this.indicator.show({

				text:   L('httpRequestConnect'),
				color:  'orange'
			});
		}


		// define request options
		var dataOffset = Number(offset),
		    urlParams = {};


		urlParams.limit = this._infiniteSteps;


		if (dataOffset && !isNaN(dataOffset)) {

			urlParams.offset = dataOffset;
		}


		// fire request
		require('/helpers/xhr/http').request({

			type:	'GET',
			format:	'JSON',
			url:	(dataURL + '&' + require('/helpers/common/tools').paramsToQueryString(urlParams))

		}).then(_done, _fail);

	}
	else if (dataURLType === 'function') {

		var result = dataURL();

		_done(result);
	}


	return;

}; // END _doLoad()


// provide public access to module
module.exports = ListView;
