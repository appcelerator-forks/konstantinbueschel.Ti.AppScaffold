/*
 * MenuView.js
 *
 * /Resources/ui/common/default/MenuView.js
 *
 * This module represents the menu view of the app
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
 * MenuView class
 *
 * @constructor
 * @param {Object} args
 * @return {Ti.UI.TableView} menu
 */
function MenuView(args) {

	// import the stylesheet
	var Stylesheet = require('/ui/Stylesheet'),
	    styles = new Stylesheet(),
	    stylesheet = styles.init('MenuWindow'),

	    Tools = require('/helpers/common/tools'),

	    lastActiveRowIndex, _rows = [];


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


	// deselect rows event callback
	require('/helpers/app/EventDispatcher').on('app:applicationDrawerMenuDeselect', _deselectRows);


	// trigger menu select event callback
	require('/helpers/app/EventDispatcher').on('app:applicationDrawerMenuTriggerSelection', _triggerMenuSelection);


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

		if (Tools.type(rowAtIndex) === 'number' && !isNaN(rowAtIndex)) {

			menu.selectRow(rowAtIndex);

			if (Tools.isAndroid) {

				var row = _rows[rowAtIndex];

				if (row) {

					row.select();
				}
			}

			lastActiveRowIndex = rowAtIndex;
		}

		return;

	} // END _selectRow()


	/**
	 * Deselects programmatically row
	 *
	 * @private
	 * @method _deselectRow
	 * @param {Number} rowAtIndex
	 * @return void
	 */
	function _deselectRow(rowAtIndex) {

		var Tools = require('/helpers/common/tools');

		rowAtIndex = parseInt(rowAtIndex, 10);

		if (Tools.type(rowAtIndex) === 'number' && !isNaN(rowAtIndex)) {

			var row = _rows[rowAtIndex];

			if (row) {

				row.deselect();
			}

			lastActiveRowIndex = undefined;
		}

		return;

	} // END _deselectRow()


	/**
	 * Deselect all selected rows
	 *
	 * @private
	 * @method _deselectRows
	 * @return void
	 */
	function _deselectRows() {

		var Tools = require('/helpers/common/tools');

		if (Tools.type(lastActiveRowIndex) === 'number') {

			if (Tools.isIOS) {

				menu.deselectRow(lastActiveRowIndex);
			}
			else {

				_deselectRow(lastActiveRowIndex);
			}

			lastActiveRowIndex = undefined;
		}

		return;

	} // END _deselectRows()


	/**
	 * Triggers programmatically menu click/touch
	 *
	 * @private
	 * @method _triggerMenuSelection
	 * @param {Object} event
	 * @return void
	 */
	function _triggerMenuSelection(event) {

		// default args
		var event = (event || {}),
			rowIndex = Number(event.rowIndex - 1);


		if (!isNaN(rowIndex)) {

			var rowSection = menu.getSections()[0];


			if (rowSection) {

				var row = rowSection.getRows()[rowIndex];

				if (row) {

					menu.fireEvent('click', {

						index: rowIndex,
						row:   row
					});
				}
			}
		}


		return;

	} // END _triggerMenuSelection()


	/**
	 * Creates the menu items with sections and rows
	 *
	 * @private
	 * @method _createMenuItems
	 * @param {Array} itemData
	 * @return {Array} menuItems
	 */
	function _createMenuItems(itemData) {

		var Tools = require('/helpers/common/tools'),
			menuItems = [];


		// check if arguments given
	    if (Tools.type(itemData) === 'array' && itemData.length) {

			var lastItemIndex = (itemData.length - 1),
				section;


		    if (Tools.isAndroid) {

			    var MenuRow = require('/ui/common/android/MenuRow');
		    }

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
		            if (Tools.isAndroid) {

			            var row = new MenuRow({

				            viewProxy: Tools.merge({

					            action: item.options.action

				            }, stylesheet.menuRow),

				            container: stylesheet.menuRowContainer,

				            title: Tools.merge({

					            text: item.options.title

				            }, stylesheet.menuRowTitle)
			            });
		            }
		            else {

			            var row = Ti.UI.createTableViewRow(Tools.merge({

				            title:   item.options.title,
				            action:  item.options.action

			            }, stylesheet.menuRow));
		            }


		            _rows.push(row);


	                // add row to section
	                if (section) {

	                    section.add(Tools.isAndroid ? row.viewProxy : row);
	                }
	                else {

	                	menuItems.push(Tools.isAndroid ? row.viewProxy : row);
	                }
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

		var Tools = require('/helpers/common/tools');


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

		var Tools = require('/helpers/common/tools'),

			rowIndex = event.index,
		    row = event.row;


		// process if not same row clicked twice
		if (lastActiveRowIndex !== rowIndex) {

			// deselect row
			if (lastActiveRowIndex > 0 || lastActiveRowIndex === 0) {

				if (Tools.isIOS) {

					menu.deselectRow(lastActiveRowIndex);
				}
				else {

					_deselectRow(lastActiveRowIndex);
				}
			}


			// select row
			_selectRow(rowIndex);


			// fire event to deselect application context menu items
			require('/helpers/app/EventDispatcher').trigger('app:applicationContextMenuDeselect');


			// navigate app to item screen
			Tools.navigateApp({
				action:			(row.action || '').trim().toUpperCase(),
				openFromHome:	true
			});
		}
		else {

			// iOS Hack: On second click on same element, iOS removes selection
			// due to this, manually select row one more time
			_selectRow(rowIndex);


			// toggle menu
			var actions = require('/helpers/common/globals').action;

			Tools.navigateApp({
				action: actions.CLOSE_MENU
			});
		}

		return;

	} // END _openMenuItem()


	return menu;

} // END MenuView()


// provide public access to module
module.exports = MenuView;
