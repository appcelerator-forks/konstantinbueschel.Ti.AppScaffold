/*
 * menu.js
 *
 * /Resources/helpers/app/menu.js
 *
 * This module represents an ActionBar and menu helper
 *
 * Author:		kbueschel
 * Date:        2015-01-09
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
 * Menu
 *
 * @constructor
 * @param {Ti.UI.Window/Ti.Android.Activity} _win/_activity
 * @param {Boolean} _winAlreadyOpen
 * @return {Menu} this
 */
function Menu() {

	// fetch activity holder (window reference)
	// or activity reference
	var _parent = arguments[0];


	// variable declaration
	var win = null,

	    activity = null,
	    actionBar = null,
	    menu = null,

	    events = {},
	    menuItems = [],
	    menuItemObjects = [],

	    $ = this;


	if (_parent) {

		// DEBUG
	Ti.API.debug('[AndroidMenu].constructor():_parent =', _parent.apiName, _parent.title, 'open?', _parent.isOpen, 'force open', arguments[1]);


		switch (_parent.apiName) {

			case 'Ti.UI.Window':

				win = _parent;

				// add window event listener
				win.addEventListener('open', onOpen);


				// fire open event for window if it is already opened
				if (win.isOpen === true || arguments[1] === true) {

					// DEBUG
				Ti.API.debug('[AndroidMenu].constructor():Fire OPEN event on window');


					win.fireEvent('open');
				}

				break;


			case 'Ti.Android.Activity':

				// DEBUG
			Ti.API.debug('[AndroidMenu].constructor():Initializes activity');


				activity = _parent;

				_initializeActivity();

				break;


			default:

				// DEBUG ERROR
				Ti.API.error('[Menu].constructor():No window or activity object passed to constructor');

				break;
		}


		// memory management
		_parent = null;
	}


	/**
	 * Triggers event with given event name
	 *
	 * @private
	 * @method trigger
	 * @param {String} name
	 * @param {Boolean} once
	 * @return void
	 */
	function trigger(name, once) {

		if (!events[name]) {
			return;
		}

		if (once) {

			while (events[name].length) {
				(events[name].shift())();
			}

		}
		else {
			var i, l;

			for ( i = 0, l = events[name].length; i < l; i++) {
				events[name][i]();
			}
		}

		return;

	} // END trigger()


	/**
	 * Adds event listener for given event with
	 * given callback. Multiple callbacks are supported.
	 *
	 * @private
	 * @method on
	 * @param {String} name
	 * @param {Function} callback
	 * @return void
	 */
	function on(name, callback) {

		events[name] || (events[name] = []);
		events[name].push(callback);

		return;

	} // END on()


	/**
	 * Removes event listener for given event
	 * with given callback
	 *
	 * @private
	 * @method off
	 * @param {String} name
	 * @param {Function} callback
	 * @return void
	 */
	function off(name, callback) {

		if ( copy = events[name]) {
			var i, l, ev;

			events[name] = [];

			for ( i = 0, l = copy.length; i < l; i++) {
				ev = copy[i];

				if (ev === callback) {
					events[name].push(ev);
				}
			}

			if (!events[name].length) {
				delete events[name];
			}
		}

		return;

	} // off()


	/**
	 * Open window callback for given window reference from args.
	 *
	 * @private
	 * @method onOpen
	 * @param {Object} e
	 * @return void
	 */
	function onOpen(e) {

		// set window open state
		win.isOpen = true;


		// remove listener because not needed any more
		win.removeEventListener('open', onOpen);


		// if no activity is given throw an error on console
		if (!win.getActivity) {

			// ERROR
			Ti.API.error('[MENU] Requires a heavyweight Window or TabGroup.');

			return;
		}


		// fetch activity
		activity = win.getActivity();

		_initializeActivity();


		return;

	} // END onOpen()


	/**
	 * Init activity with menu etc.
	 *
	 * @private
	 * @method _initializeActivity
	 * @return void
	 */
	function _initializeActivity() {

		// DEBUG
		Ti.API.debug('[AndroidMenu]._initializeActivity()');


		// build up menu
		activity.onCreateOptionsMenu = function(createOptionsMenuEvent) {

			// fetch menu object
			menu = createOptionsMenuEvent.menu;


			// clear menu before building it up new
			menu.clear();
			menuItemObjects.length = 0;


			// create menu items
			_createMenuItems(menuItems);


			return;

		}; // END onCreateOptionsMenu()


		// fetch action bar reference
		if (activity.actionBar) {

			actionBar = activity.actionBar;

			actionBar.onHomeIconItemSelected = function() {
				trigger('homeIconItemSelected');
			};

			trigger('openActionBar', true);
		}


		return;

	} // END _initializeActivity()


	/**
	 * Creates Android menu items
	 *
	 * @private
	 * @method _createMenuItems
	 * @param {Dictonary/Dictonary[]} args
	 * @return {Menu} this
	 */
	function _createMenuItems(args) {

		// DEBUG
		Ti.API.debug('[AndroidMenu]._createMenuItems()', 'args', JSON.stringify(args));


		var Tools = require('/helpers/common/tools'),
		    itemOptions = [],
		    argsType = Tools.type(args);


		if (menu) {

			if (argsType === 'object') {

				itemOptions.push(args);
			}
			else if (argsType === 'array') {

				itemOptions = args;
			}
			else {

				return $;
			}


			// DEBUG
			Ti.API.debug('[AndroidMenu]._createMenuItems()', 'itemOptions', itemOptions, JSON.stringify(itemOptions));


			itemOptions.forEach(function(options) {

				// DEBUG
				Ti.API.debug('[AndroidMenu]._createMenuItems():', Object.keys(options), 'onClick?', !!options.onClick);


				var onClick = options.onClick,
				    onCollapse = options.onCollapse,
				    onExpand = options.onExpand;

				delete options.onClick;
				delete options.onCollapse;
				delete options.onExpand;

				var menuItem = menu.add(options);

				if (onClick) {
					menuItem.addEventListener('click', onClick);
				}

				if (onCollapse) {
					menuItem.addEventListener('collapse', onCollapse);
				}

				if (onExpand) {
					menuItem.addEventListener('expand', onExpand);
				}

				menuItemObjects.push(menuItem);

				return $;

			}, $);
		}

		return $;

	} // END _createMenuItems()


	/**
	 * Reloads menu by executing invalidateOptionsMenu on
	 * current window activity
	 *
	 * @private
	 * @method reloadMenu
	 * @return void
	 */
	function reloadMenu() {

		// DEBUG
		Ti.API.debug('[AndroidMenu].reloadMenu():activity =', activity);


		if (activity) {
			activity.invalidateOptionsMenu();
		}

		return;

	} // END reloadMenu()


	// define actionBar methods
	$.actionBar = {

		hide: function() {

			if (actionBar === null) {
				on('openActionBar', $.actionBar.hide);

			}
			else {
				actionBar.hide();
			}

			return $.actionBar;
		},

		show: function() {

			if (actionBar === null) {
				on('openActionBar', $.actionBar.show);

			}
			else {
				actionBar.show();
			}

			return $.actionBar;
		},

		on: function(name, callback) {
			on(name, callback);

			return $.actionBar;
		},

		off: function(name, callback) {
			off(name, callback);

			return $.actionBar;
		},

		setOnHomeIconItemSelected: function(callback) {
			return $.actionBar.on('homeIconItemSelected', callback);
		},

		menu: $

	}; // END $.actionBar


	// extend ActionBar methods
	['BackgroundImage', 'DisplayHomeAsUp', 'Icon', 'Logo', 'Title', 'NavigationMode', 'HomeButtonEnabled', 'Subtitle'].forEach(function(name) {
		var method = 'set' + name;

		$.actionBar[method] = function(val) {

			if (actionBar === null) {

				on('openActionBar', function() {
					$.actionBar[method](val);
				});
			}
			else {
				actionBar[method](val);
			}

			return $.actionBar;
		};

	}); // END forEach()


	/**
	 * Returns ActionBar reference object
	 *
	 * @public
	 * @method getActionBar
	 * @return {Object} this.actionBar
	 */
	$.getActionBar = function() {

		return $.actionBar;

	}; // END getActionBar()


	/**
	 * Returns instance of the Android menu or if null,
	 * than it returns this instance
	 *
	 * @public
	 * @method getMenu
	 * @return {Ti.Android.Menu/Menu} this
	 */
	$.getMenu = function() {

		return menu;

	}; // getMenu()


	/**
	 * Return Android menu item object references
	 *
	 * @public
	 * @method getMenuItems
	 * @return {Ti.Android.MenuItem[]} menuItemObjects
	 */
	$.getMenuItems = function() {

		return menu.getItems();

	}; // END getMenuItems()


	/**
	 * Clears menu item references. Doesnot reload
	 * or remove currently visible items.
	 *
	 * @public
	 * @method clear
	 * @return {Menu} this
	 */
	$.clear = function() {

		menu.clear();

		menuItems.length = 0;
		menuItemObjects.length = 0;

		return $;

	}; // clear()


	/**
	 * Sets array of menu items as menu items. Discard
	 * all old menu items. Reloads menu after setting new items.
	 *
	 * @public
	 * @method set
	 * @param {Dictonary[]} mItems
	 */
	$.set = function(mItems) {

		menuItems = mItems;

		reloadMenu();

		return $;

	}; // END set()


	/**
	 * Reloads menu by execute invalditeOptionsMenu function
	 *
	 * @public
	 * @method reload
	 * @return {Menu} this
	 */
	$.reload = function() {

		reloadMenu();

		return $;

	}; // END reload()


	/**
	 * Sets all menu items to hidden
	 *
	 * @public
	 * @method hide
	 * @param {Number[]} itemsToHide
	 * @return {Menu} this
	 */
	$.hide = function(itemsToHide) {

		if (menu) {

			// load toolbox
			var Tools = require('/helpers/common/tools');


			// if given filter menu items to show
			if (itemsToHide && Tools.type(itemsToHide) === 'array' && itemsToHide.length) {

				itemsToHide.forEach(function(itemID) {

					var item = menu.findItem(itemID);

					if (item) {

						return item.setVisible(false);
					}

					return;

				}, $);
			}
			// else show all menu items
			else {

				menu.getItems().forEach(function(item) {

					return item.setVisible(false);

				}, $);
			}
		}

		return $;

	}; // END hide()


	/**
	 * Sets all menu items to visible
	 *
	 * @public
	 * @method show
	 * @param {Number[]} itemsToShow
	 * @return {Menu} this
	 */
	$.show = function(itemsToShow) {

		if (menu) {

			// load toolbox
			var Tools = require('/helpers/common/tools');


			// if given filter menu items to show
			if (itemsToShow && Tools.type(itemsToShow) === 'array' && itemsToShow.length) {

				itemsToShow.forEach(function(itemID) {

					var item = menu.findItem(itemID);

					if (item) {

						return item.setVisible(true);
					}

					return;

				}, $);
			}
			// else show all menu items
			else {

				menu.getItems().forEach(function(item) {

					return item.setVisible(true);

				}, $);
			}
		}

		return $;

	}; // END show()


	/**
	 * Toggles hidden and visible menu items to invert state
	 *
	 * @public
	 * @method toggle
	 * @return {Menu} this
	 */
	$.toggle = function() {

		if (menu) {

			menu.getItems().forEach(function(item) {

				item.setVisible(!item.isVisible());

				return $;

			}, $);
		}

		return $;

	}; // toggle()


	/**
	 * Adds menu item with options from dictonary and
	 * reloads menu
	 *
	 * @public
	 * @method add
	 * @param {Dictonary} options
	 * @return {Menu} this
	 */
	$.add = function(options) {

		// DEBUG
		Ti.API.debug('[AndroidMenu].add():', 'menu', menu, 'activity', activity);


		menuItems.push(options);


		if (menu) {

			_createMenuItems(options);
		}
		else {

			reloadMenu();
		}


		return $;

	}; // END add()


	/**
	 * Removes item and reloads menu
	 *
	 * @public
	 * @method remove
	 * @param {Number} menuItemID
	 * @returns {Menu} $/this
	 */
	$.remove = function(menuItemID) {

		if (menuItemID && menu && menu.findItem(menuItemID)) {

			menu.removeItem(menuItemID);

			var Tools = require('/helpers/common/tools'),
			    rejectPattern = {'itemId': menuItemID};

			menuItems = Tools.reject(menuItems, rejectPattern);
			menuItemObjects = Tools.reject(menuItemObjects, rejectPattern);


			// GC
			Tools = null;
			rejectPattern = null;
		}

		return $;

	}; // END remove()


	/**
	 * Removes menu items with given group ID
	 *
	 * @public
	 * @method removeGroup
	 * @param {Number} groupID
	 * @return {Menu} this/$
	 */
	$.removeGroup = function(groupID) {

		if (groupID && menu) {

			menu.removeGroup(groupID);

			var Tools = require('/helpers/common/tools'),
			    rejectPattern = {'groupId': groupID};

			menuItems = Tools.reject(menuItems, rejectPattern);
			menuItemObjects = Tools.reject(menuItemObjects, rejectPattern);


			// GC
			Tools = null;
			rejectPattern = null;
		}

		return $;

	}; // END removeGroup()


	/**
	 * Destroys menu, by removing callback functions,
	 * clearing menu and nulling out references
	 *
	 * @public
	 * @method destroy
	 * @return void
	 */
	$.destroy = function() {

		// hide & clear menu
		$.hide();
		$.clear();
		$.reload();


		// GC
		activity.onCreateOptionsMenu = null;
		activity.onPrepareOptionsMenu = null;

		activity = null;
		win = null;
		menu = null;
		$ = null;

		return;

	}; // END destroy()


	return $;

} // END Menu()


// provide public access to module
module.exports = Menu;
