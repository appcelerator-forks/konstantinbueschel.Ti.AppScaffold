/*
 * ContextMenu.js
 *
 * /Resources/ui/common/iphone/ContextMenu.js
 *
 * This module represents a context menu
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
 * ContextMenu
 *
 * @constructor
 * @param {Object} args
 * @return {ContextMenu} this
 */
function ContextMenu(args) {

	// import the stylesheet
    var Stylesheet =	require('/ui/Stylesheet'),
		Tools =			require('/helpers/common/tools'),

		_styles =		new Stylesheet(),
		_stylesheet =	_styles.init('ContextMenu'),

		_lastActiveRowIndex;


	// merge options
	var _options = Tools.merge({

		width:				146,
		backgroundColor:	'#dadada'

	}, args);


	// variable declaration
	this.isVisible = false;
	this.isOpened = false;


	// protect "this"
	var that = this;


	// fetch menu items data
	var _data = ((Tools.type(_options.data) === 'array' && _options.data) || []);


	// create content view
	this.viewProxy = Ti.UI.createWindow(Tools.combine(_stylesheet.window, {

		width:  _options.width,
		height: (_data.length * 44),

		backgroundColor: _options.backgroundColor
	}));


	// create click overlay to close context menu
	this._overlay = Ti.UI.createWindow(_stylesheet._overlay);


	// create menu view
	var _menu = Ti.UI.createTableView(_stylesheet.menu);


	// create menu items
	_menu.setData(_createMenuItems(_data));

	// add menu to window
	this.viewProxy.add(_menu);


	// add window event listener
	this.viewProxy.addEventListener('open', _onOpen);
	this._overlay.addEventListener('open', _onOverlayOpen);

    this.viewProxy.addEventListener('close', function(windowCloseEvent) {

		// remove event listener
	    var eventDispatcher = require('/helpers/app/EventDispatcher');

	    eventDispatcher.off('app:applicationContextMenuDeselect', _deselectRows);
	    eventDispatcher.off('app:closeContextMenu', _handleCloseAction);

	    eventDispatcher = null;

	    _menu.removeEventListener('click', _onMenuRowClick);


		// remove heavy views
		_menu.removeAllChildren();
		_menu.setData([]);


		// memory management
		_handleCloseAction =	null;
		_onOpen =				null;
		_onMenuRowClick =		null;
		_menu =					null;

		return;
	});

	this._overlay.addEventListener('close', function() {

		// remove event listener
		this.removeEventListener('touchstart', _onOverlayTouch);


		// GC
		_onOverlayTouch = null;


		return;
	});


	/**
	 * Window open callback
	 *
	 * @private
	 * @method _onOpen
	 * @param {Object} windowOpenEvent
	 * @return void
	 */
	function _onOpen(windowOpenEvent) {

		// remove eventlistener
		this.removeEventListener('open', _onOpen);

		// add necessary event listener
		_menu.addEventListener('click', _onMenuRowClick);

		var eventDispatcher = require('/helpers/app/EventDispatcher');

		eventDispatcher.on('app:closeContextMenu', _handleCloseAction);
		eventDispatcher.on('app:applicationContextMenuDeselect', _deselectRows);


		// update open state
		that.isOpened = true;

		// memory management
		_onOpen = null;

		return;

	} // END _onOpen()


	/**
	 * Overlay window open callback
	 *
	 * @private
	 * @method _onOverlayOpen
	 * @param {Object} overlayOpenEvent
	 * @return void
	 */
	function _onOverlayOpen(overlayOpenEvent) {

		// remove event listener
		this.removeEventListener(overlayOpenEvent.type, _onOverlayOpen);


		// add necessary event listener
		this.addEventListener('touchstart', _onOverlayTouch);


		// GC
		_onOverlayOpen = null;

		return;

	} // END _onOverlayOpen()


	/**
	 * Overlay window singletap callback - hides context menu
	 *
	 * @private
	 * @method _onOverlayTouch
	 * @param {Object} singletapEvent
	 * @return void
	 */
	function _onOverlayTouch(singletapEvent) {

		// hide context menu
		that.hide();

		return;

	} // END _onOverlayTouch()


	/**
	 * Creates the menu items
	 *
	 * @private
	 * @method _createMenuItems
	 * @param {Array} itemData
	 * @return {Array} menuItems
	 */
	function _createMenuItems(itemData) {

		var menuItems = [];

		// check if arguments given
	    if (Tools.type(itemData) === 'array' && itemData.length) {

	        itemData.forEach(function(item, index) {

                // create menu row
		        var row = Ti.UI.createTableViewRow(Tools.combine(_stylesheet.menuRow, {

			        title:          item.options.title,
			        allowSelection: (Tools.type(item.options.allowSelection) === 'boolean' ? item.options.allowSelection : true),
			        action:         item.options.action
		        }));

		        menuItems.push(row);
	        });
	    }

	    return menuItems;

	} // END _createMenuItems


	/**
	 * Execute item action
	 *
	 * @private
	 * @method _onMenuRowClick
 	 * @param {Object} event
 	 * @return void
	 */
	function _onMenuRowClick(event) {

		// fetch index from clicked row
		var rowIndex =				event.index,
		    row =                   event.row,
			isSelectionAllowed =	row.allowSelection;


		// process if not same row clicked twice
		if (_lastActiveRowIndex !== rowIndex) {

			// navigate app to item screen
			Tools.navigateApp({
				action: (row.action || '').trim().toUpperCase()
			});


			// select row that is viewed on center window
			if (!isSelectionAllowed) {

				_menu.deselectRow(rowIndex);

				if (_lastActiveRowIndex > 0 || _lastActiveRowIndex === 0) {

					_menu.selectRow(_lastActiveRowIndex);
				}
			}
			else {

				_lastActiveRowIndex = rowIndex;
			}
		}


		// hide context menu
		that.hide();


		return;

	} // END _onMenuRowClick()


	/**
	 * Callback for app wide event "app:closeContextMenu"
	 *
	 * @private
	 * @method _handleCloseAction
	 * @param {Object} closeEvent
	 * @return void
	 */
	function _handleCloseAction(closeEvent) {

		// hide context menu
		that.hide();

		return;

	} // END _handleCloseAction()


	/**
	 * Selects row at given index
	 *
	 * @private
	 * @method _selectRow
	 * @param {Number} rowAtIndex
	 * @return void
	 */
	function _selectRow(rowAtIndex) {

		var Tools = require('/helpers/common/tools');

		rowAtIndex = parseInt(rowAtIndex, 10);


		if (Tools.type(rowAtIndex) === 'number' && !isNaN(rowAtIndex)) {

			_menu.selectRow(rowAtIndex);
		}

		return;

	} // END _selectRow()


	/**
	 * Deselects rows
	 *
	 * @private
	 * @method _deselectRows
	 * @return void
	 */
	function _deselectRows() {

		if (Tools.type(_lastActiveRowIndex) === 'number') {

			_menu.deselectRow(_lastActiveRowIndex);

			_lastActiveRowIndex = undefined;
		}

		return;

	} // END _deselectRows()


	return this;

} // END ContextMenu()


/**
 * Shows context menu if not already visible
 *
 * @public
 * @method show
 * @return void
 */
ContextMenu.prototype.show = function() {

	if (!this.isVisible) {

		// open window
		if (!this.isOpened) {

			this._overlay.open();
			this.viewProxy.open();
		}

		// protect "this"
		var that = this;

		// fadein overlay
		this._overlay.animate({

			opacity:  1,
			duration: 150
		});

		// fadein window
		this.viewProxy.animate({

			opacity:	1,
			duration:	300

		}, function(animationCompleteEvent) {

			// update visible state
			that.isVisible = true;
		});
	}

	return;

}; // END show()


/**
 * Hides context menu if is visible
 *
 * @public
 * @method hide
 * @return void
 */
ContextMenu.prototype.hide = function() {

	if (this.isVisible === true) {

		// protect "this"
		var that = this;

		// hide overlay
		this._overlay.animate({

			opacity:  0,
			duration: 150
		});

		// fade out window
		this.viewProxy.animate({

			opacity:	0,
			duration:	300

		}, function(animationCompleteEvent) {

			// update visible state
			that.isVisible = false;
		});
	}

	return;

}; // END hide()


/**
 * Toggles the visibility of the menu
 *
 * @public
 * @method toggle
 * @return {Mixed} lastStatement
 */
ContextMenu.prototype.toggle = function() {

	return (this.isVisible === true ? this.hide() : this.show());

}; // END toggle()


/**
 * Closes context menu and destroys references.
 * Defined as destroy method.
 *
 * @public
 * @method close
 * @return void
 */
ContextMenu.prototype.close = function() {

	if (this.isOpened === true) {

		this._overlay.close();
		this.viewProxy.close();
	}

	return;

}; // END close()


// provide public access to module
module.exports = ContextMenu;
