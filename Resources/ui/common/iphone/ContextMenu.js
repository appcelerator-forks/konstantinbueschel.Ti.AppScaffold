/*
 * ContextMenu.js
 * 
 * /Resources/ui/common/iphone/ContextMenu.js
 * 
 * This module represents a context menu
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
 * MenuRow class
 * 
 * @constructor
 * @param {Map/Object} options
 * @return {MenuRow} this
 */
function MenuRow(options) {
    
    // DEBUG
    Ti.API.debug('[ContextMenuRow].constructor():options =', options);
    
    
    // protect "this"
    var that = this;
    
    
    // import the stylesheet
    var Stylesheet =	require('/ui/Stylesheet'),
		styles =		new Stylesheet(),
		
		Tools =			require('/helpers/common/tools');
		
	this.stylesheet =		styles.init('ContextMenu');
	this.allowSelection =	!(options.allowSelection === false);    
    
    
    // create row
    this.viewProxy = Ti.UI.createTableViewRow(Tools.combine(this.stylesheet.menuRow, {
    	
    	action:			options.action
    }));
    
    
    // create row content container
    this.contentContainer = Ti.UI.createView(this.stylesheet.menuRowContentContainer);
    
    this.viewProxy.add(this.contentContainer);
    
    
    // create row Title
    this.title = Ti.UI.createLabel(Tools.merge({
		
		text: (options.title || '')
		
	}, this.stylesheet.menuRowTitle));
    
    this.contentContainer.add(this.title);
    
    
    return this;
    
} // END MenuRow()


/**
 * Selects this row
 * 
 * @public
 * @method select
 * @return void
 */
MenuRow.prototype.select = function() {
	
	// set row background color and title label font color
	this.title.setColor(this.stylesheet.menuRow.selectedColor);
	this.contentContainer.setBackgroundColor(this.stylesheet.menuRow.selectedBackgroundColor);
	
	return;
	
}; // END select()


/**
 * Deselects this row
 * 
 * @public
 * @method deselect
 * @return void
 */
MenuRow.prototype.deselect = function() {
	
	// set row background color and title label font color
	this.title.setColor(this.stylesheet.menuRowTitle.color);
	this.contentContainer.setBackgroundColor(this.stylesheet.menuRow.backgroundColor);
		
	return;
	
}; // END deselect()




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
		
		_lastActiveRowIndex, _menuRows = [];
	
	
	// merge options
	var _options = Tools.merge({
		
		offsetPadding: {
			
			top:	0,
			right:	0,
			bottom:	0,
			left:	0
		},
		
		width:				146,
		backgroundColor:	'#dadada'
		
	}, args);
	
	
	// variable declaration
	this.isVisible = 	false;
	this.isOpened =		false;
	
	
	// protect "this"
	var that = this;
	
	
	// fetch menu items data
	var _data = ((Tools.type(_options.data) === 'array' && _options.data) || []);
	
	
	// create content view
	this.viewProxy = Ti.UI.createWindow(Tools.combine(_stylesheet.window, {
		
		width:				_options.width,
        height:				(_data.length * 44),
        
        backgroundColor:	_options.backgroundColor
        
	}));


	// create menu view
	var _menu = Ti.UI.createTableView(_stylesheet.menu);
	
	
	// create menu items
	_menu.setData(_createMenuItems(_data));
	
	// add menu to window
	this.viewProxy.add(_menu);
	
	
	// add window event listener
	this.viewProxy.addEventListener('open', _onOpen);
    
    this.viewProxy.addEventListener('close', function(windowCloseEvent) {
		
		// remove event listener
		Ti.App.removeEventListener('app:applicationContextMenuDeselect', _deselectRows);
		_menu.removeEventListener('click', _onMenuRowClick);
		Ti.App.removeEventListener('app:closeContextMenu', _handleCloseAction);
		
		// remove heavy views
		_menu.removeAllChildren();
		_menu.setData([]);
		
		_menuRows.length = 0;
				
		
		// memory management
		_handleCloseAction =	null;
		_onOpen =				null;
		_onMenuRowClick =		null;
		
		_menu =					null;
		_menuRows =				null;
		
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
		Ti.App.addEventListener('app:closeContextMenu', _handleCloseAction);
		Ti.App.addEventListener('app:applicationContextMenuDeselect', _deselectRows);
		
		// update open state
		that.isOpened = true;
		
		// memory management
		_onOpen = null;
		
		return;
		
	} // END _onOpen()
	
	
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
                var row = new MenuRow(item.options);
                
                menuItems.push(row.viewProxy);
                _menuRows.push(row);
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
			isSelectionAllowed =	_menuRows[rowIndex].allowSelection,
			
			rowIndexToSelect =		(isSelectionAllowed ? rowIndex : _lastActiveRowIndex),
			rowIndexToDeselect =	(isSelectionAllowed ? _lastActiveRowIndex : rowIndex);
		
		
		// Android: Process everytime
		// iOS: Process if not same row clicked twice
		if (Tools.isAndroid || (Tools.isIOS && _lastActiveRowIndex !== rowIndex)) {
			
			// iOS: select clicked row
			if (Tools.isIOS) {
				
				// deselect row method
				if (_lastActiveRowIndex > 0 || _lastActiveRowIndex === 0) {
					
					_menu.deselectRow(rowIndexToDeselect);
					_menuRows[rowIndexToDeselect].deselect();
				}
				
				_menu.selectRow(rowIndexToSelect);
				_menuRows[rowIndexToSelect].select();
			}	
			
			
			// update last active row index	
			_lastActiveRowIndex = rowIndexToSelect;				
							
			
			// navigate app to item screen
			Tools.navigateApp({
				action: (event.row.action || '').trim().toUpperCase()
			});
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
	 * Deselects rows
	 * 
	 * @private
	 * @method _deselectRows
	 * @return void
	 */
	function _deselectRows() {
		
		if (Tools.type(_lastActiveRowIndex) === 'number') {
			
			_menu.deselectRow(_lastActiveRowIndex);
			_menuRows[_lastActiveRowIndex].deselect();
			
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
			
			this.viewProxy.open();
		}		
		
		
		// protect "this"
		var that = this;
		
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
		
		this.viewProxy.close();
	}
	
	return;
	
}; // END close()


// provide public access to module
module.exports = ContextMenu;
