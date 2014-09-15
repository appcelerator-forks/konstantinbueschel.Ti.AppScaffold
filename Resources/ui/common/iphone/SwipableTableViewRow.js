/*
 * SwipableTableViewRow.js
 * 
 * /Resources/ui/common/iphone/SwipableTableViewRow.js
 * 
 * This module represents a table view row with swipe for aciton funktionality
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

function SwipableTableViewRow(args) {
	
	// import stylesheet
	var Tools =			require('/helpers/common/tools'),
		Stylesheet =	require('/ui/Stylesheet'),
		
		_styles =		new Stylesheet(),
		_stylesheet =	_styles.init();
		
	
	// release vars
	Stylesheet = null;
	
	
	// fetch parent
	this._parent = args.parent;
	
	delete args.parent;
		
		
	// merge options
	args = Tools.merge({
		
		buttons:			[],
		showDeleteButton:	true
		
	}, args);
	
	
	// variable declaration
	this._snapWidth;
	this._buttons =				args.buttons;
	this._title =				args.title;
	this._showDeleteButton =	args.showDeleteButton;
	this.actionButtonsVisible =	false;
	
	delete args.buttons;
	delete args.title;
	delete args.showDeleteButton;
	
	
	// protect context
	var self = this;
	
	
	// merge options
	var _rowOptions = Tools.combine(_stylesheet.swipableTableViewRow.viewProxy, args); 
	
	
	// create row element
	this.viewProxy = Ti.UI.createTableViewRow(_rowOptions);
	
	
	// add row event listener	
	this.viewProxy.addEventListener('swipe', _onRowSwipe);
	
	
	// create scroll view
	this._scrollView = Ti.UI.createScrollView(_stylesheet.swipableTableViewRow._scrollView);
	
	
	// create element content container
	this._contentView = Ti.UI.createView(_stylesheet.swipableTableViewRow._contentView);

	this._contentView.setBackgroundColor(this.viewProxy.getBackgroundColor());
	this._contentView.setLayout(this.viewProxy.getLayout());			
	
	this._contentView.addEventListener('postlayout', _afterLayout);
	this._contentView.addEventListener('singletap', _handleTap);
	
	this._scrollView.add(this._contentView);
	
	
	
	// create title label if title is given in arguments
	if (this._title && this._title.length) {
		
		var _titleView = Ti.UI.createLabel(_stylesheet.swipableTableViewRow._titleView);
		
		_titleView.setText(this._title);
		
		this._contentView.add(_titleView);
		
		_titleView = null;
	}
	
	
	// create action button container
	this._actionButtonContainer = Ti.UI.createView(_stylesheet.swipableTableViewRow._actionButtonContainer);
	
	this._scrollView.add(this._actionButtonContainer);
	
	
	// define delete button if needed
	if (this._buttons && this._showDeleteButton === true) {
		
		var _deleteButton = _stylesheet.swipableTableViewRow._defaultDeleteButton;
		
		_deleteButton.callback = (this._parent ? _deleteRow : function() {});
		
		this._buttons.push(_deleteButton);
	}
	
	
	// create action buttons
	this._buttons.forEach(function(button, buttonIndex) {
		
		// fetch callback if given
		var callback;			
		
		if (button.callback) {
			
			callback = button.callback;
			delete button.callback;
		}
		
		
		// set button index
		button.index =	buttonIndex;
		
		
		// normalize button width and height		
		if (Tools.type(button.width) !== 'number') {
			
			button.width =	Ti.UI.SIZE;
		}
		
		if (Tools.type(button.height) !== 'number') {
			
			button.height =	Ti.UI.SIZE;
		}
		
		
		// create button conatiner and button
		var _buttonContainer =	Ti.UI.createView(_stylesheet.swipableTableViewRow._buttonContainer),
			_button =			Ti.UI.createButton(button);
		
		_buttonContainer.setBackgroundColor(button.backgroundColor);
		
		
		// add button to button container
		_buttonContainer.add(_button);
		
		
		// set callback for button click
		if (callback) {
			
			_button.addEventListener('click', callback);
		}
		
		
		// add button container to action button container
		this._actionButtonContainer.add(_buttonContainer);
		
		return;
		
	}, this);
	
	
	// add scroll view to row
	this.viewProxy.add(this._scrollView);
	
	
	/**
	 * Single tap callback
	 * 
	 * @private
	 * @method _handleTap
	 * @param {tapEvent}
	 * @return void
	 */
	function _handleTap(tapEvent) {
		
		self.viewProxy.fireEvent('click', {
			
			recordData: self.recordData
		});
		
		return;
		
	} // END _handleTap()
	
	
	/**
	 * Postlayout event callback
	 * 
	 * @private
	 * @method _afterLayout
	 * @param {Object} postlayoutEvent
	 * @return void 
	 */
	function _afterLayout(postlayoutEvent) {
		
		// remove event listener
		this.removeEventListener('postlayout', _afterLayout);
		
		
		// fetch element size to adjust children sizes
		var contentSize =	self._contentView.getSize(),
			minRowHeight =	_stylesheet.swipableTableViewRow.minRowHeight;
		
		
		// set minimum height
		if (contentSize.height < minRowHeight) {
			
			contentSize.height = minRowHeight;
		}
		
		
		// set height for children
		self._actionButtonContainer.setHeight(contentSize.height);
		
		
		// set snap width that would be visible on row swipe
		self._snapWidth = self._actionButtonContainer.getSize().width;
		
		
		// make container element visible
		self._scrollView.setVisible(true);
		
		return;
		
	} // END _afterLayout()
	
	
	/**
	 * Row swipe callback
	 * 
	 * @private
	 * @method _onRowSwipe
 	 * @param {Object} swipeEvent
 	 * @return void
	 */
	function _onRowSwipe(swipeEvent) {
		
		if (swipeEvent.direction === 'left') {
	        
	        if (self._parent.currentRow) {
	        	
	        	self._parent.currentRow.closeActionButtons();
	        }
	        
	        self._parent.currentRow = self;
	        
	        self._scrollView.contentOffset = {
	        	
	        	x: self._snapWidth,
	        	y: 0
	        };
	    }
	    else {
	        
	        self._scrollView.contentOffset = {
	        	
	        	x: 0,
	        	y: 0
	        };
	    }
	    
	    self.actionButtonsVisible = (swipeEvent.direction === 'left');
	    
	    return;
	    
	} // END _onRowSwipe()
	
	
	/**
	 * Deletes row from parent tableview
	 * 
	 * @private
	 * @method _deleteRow
	 * @param {Object} clickEvent
	 * @reutrn void
	 */
	function _deleteRow(clickEvent) {
		
		if (self._parent) {
			
			var apiName = (self._parent.viewProxy || self._parent).apiName;
			
			if (apiName && apiName === 'Ti.UI.TableView') {
				
				(self._parent.viewProxy || self._parent).deleteRow(self.viewProxy, {
					
					animated:		true,
					animationStyle:	Ti.UI.iPhone.RowAnimationStyle.TOP
				});
			}
		}
		
		return;
		
	} // END _deleteRow()
	
	
	return this;
	
} // END SwipableTableViewRow()


/**
 * Adds element to row
 * 
 * @public
 * @method add
 * @param {Ti.UI.View} element
 */
SwipableTableViewRow.prototype.add = function(element) {
	
	if (element) {
		
		this._contentView.add(element);
	}
	
	return;
	
}; // END add()


/**
 * Remove element from row
 * 
 * @public
 * @method remove
 * @param {Object} element
 * @return void
 */
SwipableTableViewRow.prototype.remove = function(element) {
	
	if (element) {
		
		this._contentView.remove(element);
	}
	
	return;
	
}; // END remove()


/**
 * Adds event listener to row
 * 
 * @public
 * @method addEventListener
 * @param {String} event
 * @param {Function} callback
 * @return void
 */
SwipableTableViewRow.prototype.addEventListener = function(event, callback) {
	
	if (event && callback) {
		
		this.viewProxy.addEventListener(event, callback);
	}
	
	return;
	
}; // END addEventListener()


/**
 * Remove event listener to row
 * 
 * @public
 * @method removeEventListener
 * @param {Object} event
 * @param {Object} callback
 * @return void
 */
SwipableTableViewRow.prototype.removeEventListener = function(event, callback) {
	
	if (event && callback) {
		
		this.viewProxy.removeEventListener(event, callback);
	}
	
	return;
	
}; // END removeEventListener()


/**
 * Close actions buttons
 * 
 * @public
 * @method closeActionButtons
 * @return void
 */
SwipableTableViewRow.prototype.closeActionButtons = function() {
	
	if (this.actionButtonsVisible) {
		
		this._scrollView.contentOffset = {
			x:	0,
			y:	0
		};
	}
	
	return;
	
}; // END closeActionButtons()


// provide public access to module
module.exports = SwipableTableViewRow;
