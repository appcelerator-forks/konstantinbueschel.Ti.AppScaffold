/*
 * ListView.js
 * 
 * /Resources/ui/common/iphone/ListView.js
 * 
 * This module represents the default list view with PullToRefresh and Infinite Scroll
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
	this.isFetchingData =		false;
	this.hasNetworkConnection =	Tools.hasNetworkConnectivity();
	
    this.rows = [];
			
		
	// protect context
	var that = this;
	
	
	// create indicator for notifications
	this.indicator = require('de.marcelpociot.mwkprogress');
		
	
	// create listview
    this.viewProxy = Ti.UI.createTableView(this.stylesheet.listView.view);
    
    
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
    		
    		this.viewProxy.setRefreshControl(this.pullToRefreshControl);
    		
	    	this.pullToRefreshControl.addEventListener('refreshstart', _onRefreshStart);
    	}
    	
    	return;
    	
    }; // END _attachPullToRefresh()
    
    
    /**
     * Dettaches pull to refresh functionality
     * 
     * @private
     * @method _dettachPullToRefresh
     * @return void
     */
    this._dettachPullToRefresh = function() {
    	
    	if (that.pullToRefreshControl) {
    		
    		that.pullToRefreshControl.removeEventListener('refreshstart', _onRefreshStart);
    		
    		that.pullToRefreshControl = null;
    		
    		that.viewProxy.setRefreshControl(that.pullToRefreshControl);
    		
    		that.pullToRefreshControl = undefined;
    	}
    	
    	return;
    	
    }; // END _dettachPullToRefresh()
    
    
    /**
     * On pull to refresh header refresh start callback
     * 
     * @private
     * @method _onRefreshStart
     * @param {Object} refreshStartEvent
     * @return void
     */
    function _onRefreshStart(refreshStartEvent) {
		
		if (that.isFetchingData === false) {
			
			// load data
			that.load();    		
		}
		else if (that.pullToRefreshControl) {
			
			that.pullToRefreshControl.endRefreshing();
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
    	that.viewProxy.addEventListener('scroll', _onScrolling);
    	
    	return;
    	
    }; // END _attachInfiniteScroll()
    
    
    /**
     * Dettaches infinite scroll functionality
     * 
     * @private
     * @method _dettachInfiniteScroll
     * @return void
     */
    this._dettachInfiniteScroll = function() {
    	
    	// remove list view event listener
    	that.viewProxy.removeEventListener('scroll', _onScrolling);
    	
    	return;
    	
    }; // END _dettachInfiniteScroll()
    
    
    /**
	 * list view scroll callback
	 * 
	 * @private
	 * @method _onScrolling
	 * @param {Object} scrollEvent
	 * @return void
	 */
	function _onScrolling(scrollEvent) {
	    
	    var offset =	scrollEvent.contentOffset.y,
			height =	scrollEvent.size.height,
			total =		(offset + height),
			theEnd =	scrollEvent.contentSize.height,
			distance =	(theEnd - total);
	
	
		// going down is the only time we dynamically load,
		// going up we can safely ignore -- note here that
		// the values will be negative so we do the opposite
		if (!that.isFetchingData 
				&& that.rows.length 
					&& offset > 0 
						&& distance < _lastDistance) {
			
			// adjust the % of rows scrolled before we decide to start fetching
			var nearEnd = theEnd;
	
			if (total >= nearEnd) {
				
	        	// load more data
		        that._doNext();
			}
		}
		
		_lastDistance = distance;
	    
	    return;
	    
	}; // END _onScrolling()
	
	
	/**
	 * Activate network change notifications
	 * 
	 * @private
	 * @method _activateNetworkNotifications
	 * @return void
	 */
	this._activateNetworkNotifications = function() {
		
		Ti.App.addEventListener('app:networkChange', _handleNetworkChanges);
		
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
		
		Ti.App.removeEventListener('app:networkChange', _handleNetworkChanges);
		
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
		
		// show notification
		switch (networkChangeEvent.networkType) {
			
			case Ti.Network.NETWORK_NONE:
				
				// show permanent notification
				that.indicator.showMessageWithColor({
					
					message:	L('networkChangeDisconnected'),
					color:		'#ff0000'
				});
				
				
				// disable infinite scroll
				that._dettachInfiniteScroll();
				
				break;
				
				
			default:
				
				if (!that.hasNetworkConnection && networkChangeEvent.online) {
					
					// enable infinite scroll
					that._attachInfiniteScroll();
					
					
					// show-live notification
					that.indicator.showMessageWithColorDuration({
						
						message:	L('networkChangeConnected'),
						color:		'#00ff00',
						duration:	2
					});
				}
				
				break;
		}
		
		
		// set has network connection state
		that.hasNetworkConnection = networkChangeEvent.online;
		
		return;
		
	} // END _handleNetworkChanges()
    
    
    // attach pull to refresh if required
	if (this.options.activatePullToRefresh === true) {
		
		this._attachPullToRefresh();			
    }
    
    
    // attach infinite scroll if required
    if (this.options.activateInfiniteScroll === true) {
    	
    	var _infiniteSteps =	8,
			_infiniteOffset =	0,
			_lastDistance =		0;
    	
    	this._attachInfiniteScroll();
    }
    
    
    // attach network notification changes if required
    if (this.options.activateNetworkNotifications === true) {
    	
    	this._activateNetworkNotifications();
    }
    
	return this;
	
} // END ListView()


/**
 * Add loading spinner row to the 
 * end of list view
 * 
 * @private
 * @method _attachLoadingWidget
 * @return void
 */
ListView.prototype._attachLoadingWidget = function() {
    
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
    this.viewProxy.appendRow(loadingRow, {

    	animated:		true,
    	
    	animationStyle:	Ti.UI.iPhone.RowAnimationStyle.BOTTOM,
    	position:		Ti.UI.iPhone.TableViewScrollPosition.BOTTOM
    });
    
    return;
    
}; // END _attachLoadingWidget()
	

/**
 * Pass an array of row objects to update list view
 * 
 * @public
 * @method updateData
 * @param {Ti.UI.TableViewRow[]} rows
 * @return void
 */
ListView.prototype.updateData = function(rows) {
    
    // delete last row from rows array
    var lastRow =				this.rows.pop(),
    	isLastRowLoadingRow =	(lastRow.className === 'loading'); 
	
	if (!isLastRowLoadingRow) {
    	
    	this.rows.push(lastRow);
    }
    
	    
    // concat rows array with new data
    this.rows = this.rows.concat(rows);
    
    
    // stops freshing indicator
    if (this.isFetchingData === true) {
		
		if (isLastRowLoadingRow) {
			
			this.viewProxy.deleteRow(lastRow);
		}
		
		if (this.pullToRefreshControl) {
			
    		this.pullToRefreshControl.endRefreshing();
		}
    } 
    
    
    // append new rows
    if (rows.length) {
    	
    	this.view.appendRow(rows);
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
		this.viewProxy.setData(this.rows);
		
		
    	// enable list view scrolling
    	this.viewProxy.setScrollable(true);
	}
	
	
	// shows up emptyView if no rows given
	if (!this.rows.length) {
		
		this._showEmptyView();
	}
	
	return;
	
}; // END populate()


/**
 * Shows up empty view if no rows given
 */
ListView.prototype._showEmptyView = function() {
	
	if (!this.isFetchingData && !this.rows.length && this.options.emptyView) {
	
		// disable list view scrolling
		this.viewProxy.setScrollable(false);
		
		
		// create loading row
		var noDataRow = Ti.UI.createTableViewRow(this.stylesheet.listView.noDataRow.row);
		
		noDataRow.add(this.options.emptyView);
		
		
		// replace list view data with loading row
		this.viewProxy.setData([noDataRow]);
		
		
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
		this.viewProxy.setScrollable(false);
		
		
		// create loading row
		var loadingRowStyles =	this.stylesheet.listView.loadingRow,
		
			loadingRow =		Ti.UI.createTableViewRow(loadingRowStyles.row),
			loadingSpinner =	Ti.UI.createActivityIndicator(loadingRowStyles.loadingSpinner);
		
		loadingRow.add(loadingSpinner);


		// replace list view data with loading row
		this.viewProxy.setData([loadingRow]);
		
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
			this.viewProxy.deleteRow(lastRow);
			
			
			// activated scrolling
			this.viewProxy.setScrollable(true);	    	
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
		
		rowData.forEach(function(singleRowData, index) {
			
			// create row object
			var row = Ti.UI.createTableViewRow(Tools.combine(this.stylesheet.listView.rows.row, {
				
				title:		singleRowData.title,
				recordData:	singleRowData
			}));
					
			rows.push(row);
			
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
	
	// load toolbox
	var Tools = require('/helpers/common/tools');
	
	
	// check if we can loadData	
	if (this.hasNetworkConnection === true) {
		
		if (!this.isFetchingData) {
			
			this._doRefresh(loadCallback);
		}		
	}
	// else if (this.isRefreshing && this.pullToRefreshControl) {
	else if (this.pullToRefreshControl) {
		
		// this.isRefreshing = false;
		this.pullToRefreshControl.endRefreshing();
	}
	
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
 * @return void
 */
ListView.prototype._doNext = function(loadCallback, nextPage) {
	
	this._attachLoadingWidget();
	this._doLoad(loadCallback, nextPage);
	
	return;
	
}; // END _doNext()


/**
 * Load data
 * 
 * @private
 * @method _doLoad
 * @parma {Function} loadCallback
 * @return void
 */
ListView.prototype._doLoad = function(loadCallback) {
	
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
	
	
	// display loading row
	this.showLoadingRow();


	// set loading state	
	this.isFetchingData = true;


	// load toolbox
	var Tools = require('/helpers/common/tools');
	
	
	// protect context
	var that = this;
	
	
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
		
		
		// parse data objects
		var resultObjects;
		
		if (result) {
			
			switch (Tools.type(result.data)) {
				
				case 'string':
				
					resultObjects = JSON.parse(result.data);
					break;
					
				case 'array':
					
					resultObjects = result.data;
					break;	
			}
		}
		
		
		// populate list view
		that.populate(resultObjects);
		
		
		// stop pull to refresh
		if (that.pullToRefreshControl) {
			
			that.pullToRefreshControl.endRefreshing();
		}
		
		
		// set loading state
		that.isFetchingData = false;
		
		// enable scrolling of list view
		that.viewProxy.setScrollable(true);
		
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
		
		
		// stops pull to refresh
		// if (that.isRefreshing && that.pullToRefreshControl) {
		if (that.pullToRefreshControl) {
			
			// that.isRefreshing =	false;
			that.pullToRefreshControl.endRefreshing();
		}
		
		
		// set loading state
		that.isFetchingData = false;
		
		
		// enable scrolling of list view
		that.viewProxy.setScrollable(true);
		
		return;
		
	} // END _fail()
	
	
	// process data loading	
	var dataURL =		this.options.dataURL,
		dataURLType =	Tools.type(dataURL);	
	
	
	if (dataURLType === 'string') {
		
		// load HTTP/XHR module
		var HTTP = require('/helpers/xhr/http');
		
		
		// fire request
		HTTP.request({
			
			type:	'GET',
			format:	'JSON',
			url:	dataURL
			
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
