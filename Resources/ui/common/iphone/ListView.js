/*
 * ListView.js
 *
 * /Resources/ui/common/iphone/ListView.js
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

		activatePullToRefresh:			true,
		activateInfiniteScroll:			true,
		activateNetworkNotifications:	true,

		emptyView:						undefined,
		dataURL:						undefined

	}, args);


	// variable initialization
	this._isInitialzed = false;
	this._infiniteSteps = 10;
	this._infiniteOffset = 0;

	this.isFetchingData = false;
    this.rows = [];

	var _lastScrollPosition,
	    _parentHeight,
	    self = this;


	// create element container
	this.viewProxy = Ti.UI.createView(this.stylesheet.listView.viewProxy);


	// create listview
    this.listView = Ti.UI.createTableView(this.stylesheet.listView.listView);

	this.viewProxy.add(this.listView);


	// add postlayout event listener to fire analytics screen view
	this.viewProxy.addEventListener('postlayout', function(layoutEvent) {

		// remove event listener
		this.removeEventListener(layoutEvent.type, arguments.callee);


		// add list item click callback
		this.listView.addEventListener('click', _onListItemSelected);


		// fire tracking event
		require('/helpers/analytics/ga').screen(L('windowTitleExampleView'));


		return;
	});


	// create indicator for notifications
	var Notification = require('/ui/common/default/Notification');

	this.indicator = new Notification({

		parent: this.viewProxy
	});

	Notification = null;


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

    	if (!this.pullToRefreshControl) {

    		this.pullToRefreshControl = Ti.UI.createRefreshControl(this.stylesheet.listView.pullToRefreshHeader);

    		this.listView.setRefreshControl(this.pullToRefreshControl);

	    	this.pullToRefreshControl.addEventListener('refreshstart', _onRefreshStart);
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

    	if (this.pullToRefreshControl) {

		    this.pullToRefreshControl.removeEventListener('refreshstart', _onRefreshStart);

		    this.pullToRefreshControl = null;

		    this.listView.setRefreshControl(this.pullToRefreshControl);

		    this.pullToRefreshControl = undefined;
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

		if (self.isFetchingData === false) {

			// load data
			self._doRefresh();
		}
		else if (self.pullToRefreshControl) {

			self.pullToRefreshControl.endRefreshing();
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

    	// adding list view event listener
    	this.listView.addEventListener('scroll', _onScrolling);

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

	    // grab touch offset
	    var offset = scrollEvent.contentOffset.y;

	    if (!_parentHeight) {

		    _parentHeight = self.viewProxy.getRect().height;
	    }


	    // going down is the only time we dynamically load,
	    // going up we can safely ignore
	    if (!self.isFetchingData
		    && self.rows.length
		        && scrollEvent.contentSize.height > _parentHeight
		            && _lastScrollPosition
		                && offset > _lastScrollPosition
		                    && (offset + scrollEvent.size.height) > scrollEvent.contentSize.height) {

		    // load more data
		    self._doNext(undefined, self._infiniteOffset + self._infiniteSteps);
	    }


	    // remember last position
	    _lastScrollPosition = offset;


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

		require('/helpers/app/EventDispatcher').on('app:networkChange', _handleNetworkChanges);

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


    // attach pull to refresh if required
	if (this.options.activatePullToRefresh === true) {

		this._attachPullToRefresh();
    }


    // attach infinite scroll if required
    if (this.options.activateInfiniteScroll === true) {

    	this._attachInfiniteScroll();
    }


    // attach network notification changes if required
    if (this.options.activateNetworkNotifications === true) {

    	this._activateNetworkNotifications();
    }

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

	if (rowCount && this.rows[rowCount - 1].className === 'loading') {

		return;
	}


    // create loading row
    var loadingRowStyles =	this.stylesheet.listView.loadingRow,

		loadingRow =		Ti.UI.createTableViewRow(loadingRowStyles.row),
		loadingSpinner =	Ti.UI.createActivityIndicator(loadingRowStyles.loadingSpinner);

    loadingRow.setHeight(this.rows[0].getSize().height);

    loadingRow.add(loadingSpinner);
    loadingSpinner.show();


    // add loading row to the rows array
    this.rows.push(loadingRow);


    // add loading row to table view
    this.listView.appendRow(loadingRow, {

    	animated:		true,
    	animationStyle:	Ti.UI.iPhone.RowAnimationStyle.BOTTOM
    });

	this.listView.scrollToIndex(this.rows.length - 1, {

		position: Ti.UI.iPhone.TableViewScrollPosition.BOTTOM
	});


    return;

}; // END _attachLoadingWidget()


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


	// delete last row from rows array
	var lastRow = this.rows.pop(),
	    isLastRowLoadingRow = (lastRow.className === 'loading');


	if (!isLastRowLoadingRow) {

		this.rows.push(lastRow);
	}


	// create rows
	var rows = this.createRows(rowData);


	// concat rows array with new data
	this.rows = this.rows.concat(rows);


	// hide loading indicator
	if (isLastRowLoadingRow) {

		this.listView.deleteRow(lastRow);
	}

	if (this.pullToRefreshControl) {

		this.pullToRefreshControl.endRefreshing();
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
 * @param {Dictonary[]} rowData
 * @return void
 */
ListView.prototype.populate = function(rowData) {

	// load toolbox
	var Tools = require('/helpers/common/tools');


	if (Tools.type(rowData) === 'array' && rowData.length) {

		// create rows
		this.rows = this.createRows(rowData);


		// stops freshing indicator
	    if (this.isFetchingData === true) {

			if (this.pullToRefreshControl) {

	    		this.pullToRefreshControl.endRefreshing();
			}
	    }


		// set new rows
		this.listView.setData(this.rows);


    	// enable list view scrolling
    	this.listView.setScrollable(true);
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

		// disable list view scrolling
		this.listView.setScrollable(false);


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

		// disable list view scrolling
		this.listView.setScrollable(false);


		// create loading row
		var loadingRowStyles =	this.stylesheet.listView.loadingRow,

			loadingRow =		Ti.UI.createTableViewRow(loadingRowStyles.row),
			loadingSpinner =	Ti.UI.createActivityIndicator(loadingRowStyles.loadingSpinner);

		loadingRow.add(loadingSpinner);


		// replace list view data with loading row
		this.listView.setData([loadingRow]);

		this.rows.push(loadingRow);


		// show loading spinner
		loadingSpinner.show();
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

	if (this.rows.length == 1) {

		var lastRow =				this.rows.pop(),
	    	isLastRowLoadingRow =	(lastRow.className === 'loading');

		if (isLastRowLoadingRow) {

			// delete loading row
			this.listView.deleteRow(lastRow);


			// activated scrolling
			this.listView.setScrollable(true);
	    }
	    else {

	    	this.rows.push(lastRow);
	    }
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
		// populate list view fresh
		else {

			self.populate(resultObjects);
		}


		// stop pull to refresh
		if (self.pullToRefreshControl) {

			self.pullToRefreshControl.endRefreshing();
		}


		// set loading state
		self.isFetchingData = false;

		// update init state
		self._isInitialzed = true;

		// enable scrolling of list view
		self.listView.setScrollable(true);

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
		if (self.pullToRefreshControl) {

			self.pullToRefreshControl.endRefreshing();
		}


		// set loading state
		self.isFetchingData = false;


		// hide loading row
		self.hideLoadingRow();


		// enable scrolling of list view
		self.listView.setScrollable(true);


		// error notification
		var notificationOptions = {

			text:   requestResult.error,
			color:  '#ff0000'
		};

		if (requestResult.code !== -1009 || self.rows.length) {

			notificationOptions.duration = 2;
		}

		if (requestResult.code === -1009) {

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


		// define url params
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
			url:	(dataURL + '&' + Tools.paramsToQueryString(urlParams))

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
