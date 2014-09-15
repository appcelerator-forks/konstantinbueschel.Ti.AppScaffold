/*
 * MenuView.js
 * 
 * /Resources/ui/common/default/MenuView.js
 * 
 * This module represents the menu view of the app
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
    
    // protect "this"
    var that = this;
    
    
    // import the stylesheet
    var Stylesheet =	require('/ui/Stylesheet'),
		styles =		new Stylesheet(),
		
		Tools =			require('/helpers/common/tools');
		
	this.stylesheet =	styles.init('MenuWindow');
    
    
    // create row
    this.viewProxy = Ti.UI.createTableViewRow(Tools.merge({
    	
    	action:	options.action
    	
    }, this.stylesheet.menuRow));  
    
    
    // create row content container
    this.contentContainer = Ti.UI.createView(this.stylesheet.menuRowContentContainer);
    
    this.viewProxy.add(this.contentContainer);
    
    
    // create row Title
    this.title = Ti.UI.createLabel(Tools.merge({
    	
    	text:	(options.title || '')
    	
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
	
	return;
	
}; // END deselect()




/**
 * MenuView class
 * 
 * @constructor
 * @param {Object} args
 * @return {Ti.UI.TableView} menu
 */
function MenuView(args) {

	// import the stylesheet
	var Stylesheet =	require('/ui/Stylesheet'),
		styles =		new Stylesheet(),
		stylesheet =	styles.init('MenuWindow'),
		
		Tools =			require('/helpers/common/tools'),
		
		lastActiveRowIndex, menuRows = [];
	
	
	// merge args
	var options = Tools.merge({
		
		selectedItemIndex:	undefined
		
	}, args);
	
		
	// build up menu view
	var menu = Ti.UI.createTableView(stylesheet.menuView);	
	
	// create and add menu items
	menu.setData(_createMenuItems(stylesheet.menuItems));
	
	// add event listener
	menu.addEventListener('click', _openMenuItem);
	
	
	// iOS: deselect rows event callback
	if (Tools.isIOS) {
		
		Ti.App.addEventListener('app:applicationDrawerMenuDeselect', _deselectRows);
	}
	
	
	// if a menu item should be selected a startup
	_selectRow(options.selectedItemIndex);
	
	
	/**
	 * Selects programmatically a row
	 * 
	 * @private
	 * @method _selectRow
	 * @param {Number} rowAtIndex
	 * @return void
	 */
	function _selectRow(rowAtIndex) {
		
		var Tools = require('/helpers/common/tools');
		
		rowAtIndex = parseInt(rowAtIndex, 10);
		
		if (Tools.type(rowAtIndex) === 'number' && menuRows[rowAtIndex]) {
			
			menu.selectRow(rowAtIndex);
			menuRows[rowAtIndex].select();
			
			lastActiveRowIndex = rowAtIndex;
		}
		
		return;
		
	} // END _selectRow()
	
	
	/**
	 * Deselect all selected rows
	 * 
	 * @private
	 * @method _deselectRows
	 * @return void
	 */
	function _deselectRows() {
		
		if (Tools.type(lastActiveRowIndex) === 'number') {
			
			menu.deselectRow(lastActiveRowIndex);
			menuRows[lastActiveRowIndex].deselect();
			
			lastActiveRowIndex = undefined;
		}
		
		return;
		
	} // END _deselectRows()
	
	
	/**
	 * Creates the menu items with sections and rows
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
	        
			var lastItemIndex = (itemData.length - 1),
				section;
	        
	        itemData.forEach(function(item, index) {
				
				var isLastItem = (index === lastItemIndex);            
	            
	            if (item.type === 'SECTION') {
	                
	                if (section) {
	                    menuItems.push(section);
	                }
	                
	                // Section erstellen
	                section = _createMenuSection(item.options);
	            }
	            else if (item.type === 'ITEM') {
	                
	                // create menu row
	                var row = new MenuRow(item.options);
	                
	                // add row to section
	                if (section) {
	                    section.add(row.viewProxy);    
	                }
	                else {
	                	
	                	menuItems.push(row.viewProxy);
	                }
	                
	                menuRows.push(row);
	            }
	            
	            // on last push last row to menu items array
	            // otherwise it would not be visible in menu
	            if (section && isLastItem) {
	                menuItems.push(section);    
	            }
	        });
	    }
	    
	    return menuItems;
		
	} // END _createMenuItems
	
	
	/**
	 * Creates a menu section
	 * 
	 * @private
	 * @method _createMenuSection
	 * @param {Object} sectionData
	 * @return {Ti.UI.TableViewSection} section
	 */
	function _createMenuSection(sectionData) {
		
	    // create section headerview
	    var sectionHeaderView = Ti.UI.createView(stylesheet.menuSectionHeaderView);
	    
	    
	    // add label to headerview
	    sectionHeaderView.add(Ti.UI.createLabel(Tools.merge({
	    	
	    	text:	sectionData.title
	    	
	    }, stylesheet.menuSectionHeaderTitle)));    
	        
	        
	    // create and return tableview section
	    return Ti.UI.createTableViewSection({
	       
	        headerView: sectionHeaderView
	    });
		
	} // END _createMenuSection()
	
	
	/**
	 * Navigate to item screen
	 * 
	 * @private
	 * @method _openMenuItem
 	 * @param {Object} event
 	 * @return void
	 */
	function _openMenuItem(event) {
		
		var rowIndex = event.index;
		
		
		// Android: Process everytime
		// iOS: Process if not same row clicked twice
		if (Tools.isAndroid || (Tools.isIOS && lastActiveRowIndex !== rowIndex)) {
			
			// iOS: select clicked row
			if (Tools.isIOS) {
				
				// deselect row
				if (lastActiveRowIndex > 0 || lastActiveRowIndex === 0) {
					
					menu.deselectRow(lastActiveRowIndex);
					menuRows[lastActiveRowIndex].deselect();
				}
				
				
				// select row				
				_selectRow(rowIndex);
			}
			
			
			// update last active row index
			if (Tools.isAndroid) {
				
				lastActiveRowIndex = rowIndex;
			}		
			
			
			// fire event to deselect application context menu items
			Ti.App.fireEvent('app:applicationContextMenuDeselect');
			
			
			// navigate app to item screen
			Tools.navigateApp({
				action:			(event.row.action || '').trim().toUpperCase(),
				openFromHome:	true
			});	
		}
		else {
			
			// iOS Hack: On second click on same element, iOS removes selection
			// due to this, manually select row one more time
			if (Tools.isIOS) {
				
				_selectRow(rowIndex);	
			}
			
			
			// toggle menu
			var actions = require('/helpers/common/globals').global.action;
			
			Tools.navigateApp({
				action: actions.TOGGLE_MENU
			});
		}
		
		return;
			
	} // END _openMenuItem()
	
	
	return menu; 

} // END MenuView()


// provide public access to module
module.exports = MenuView;
