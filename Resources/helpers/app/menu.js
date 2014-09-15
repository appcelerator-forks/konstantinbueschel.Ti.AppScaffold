/*
 * menu.js
 * 
 * /Resources/lib/menu.js
 * 
 * This module represents an ActionBar and menu helper
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
 * Menu
 * 
 * @constructor
 * @param {Ti.UI.Window} _win
 * @param {Boolean} _winAlreadyOpen
 * @return {Menu} this
 */
function Menu(_win, _winAlreadyOpen) {
	
	// variable declaration
	var win =				_win,
	 
		activity =			null, 
		actionBar =			null,
		 
		events =			{}, 
		menuItems =			[], 
		menuItemObjects =	[],
		 
		$ =					this;
	
	
	// add window event listener
	win.addEventListener('open', onOpen);
	
	
	// fire open event for window if it is already opened
	if (win.isOpen === true || _winAlreadyOpen === true) {
		
		win.fireEvent('open');
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


		// build up menu
		activity.onCreateOptionsMenu = function(e) {
			
			// fetch menu object
			var menu = e.menu;


			// clear menu before building it up new
			menu.clear();
			menuItemObjects.length = 0;


			menuItems.forEach(function(options) {
				
				var onClick =		options.onClick,
					onCollapse =	options.onCollapse,
					onExpand =		options.onExpand;
				
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
			});
		};

		reloadMenu();

		if (activity.actionBar) {
			
			actionBar = activity.actionBar;

			actionBar.onHomeIconItemSelected = function() {
				trigger('homeIconItemSelected');
			};

			trigger('openActionBar', true);
		}
		
		return;
		
	} // END onOpen()
	
	
	/**
	 * Reloads menu by executing invalidateOptionsMenu on 
	 * current window activity
	 * 
	 * @private
	 * @method reloadMenu
	 * @return void
	 */
	function reloadMenu() {
		
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
	 * Returns instance of this menu
	 * 
	 * @public
	 * @method getMenu
	 * @return {Menu} this
	 */
	$.getMenu = function() {
		
		return $;
		
	}; // getMenu()


	/**
	 * Clears menu item references. Doesnot reload
	 * or remove currently visible items.
	 * 
	 * @public
	 * @method clear
	 * @return {Menu} this
	 */
	$.clear = function() {
		
		menuItems.length =			0;
		menuItemObjects.length =	0;
		
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
		
		// load toolbox
		var Tools =				require('/helpers/common/tools'),
			filteredMenuItems =	menuItemObjects;
		
		
		// if given filter only items to show
		if (itemsToHide && Tools.type(itemsToHide) === 'array') {
			
			filteredMenuItems = filteredMenuItems.filter(function(menuItem, menuItemIndex) {
				
				return (Tools.contains(itemsToHide, menuItem.getItemId()) !== false);
			});
		}
		
		
		// hide menu items
		if (menuItemObjects && menuItemObjects.length) {
			
			menuItemObjects.forEach(function(menuItem) {
				
				menuItem.setVisible(false);
				
				return this;	
			}, $);
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
		
		// load toolbox
		var Tools =				require('/helpers/common/tools'),
			filteredMenuItems =	menuItemObjects;
		
		
		// if given filter only items to show
		if (itemsToShow && Tools.type(itemsToShow) === 'array') {
			
			filteredMenuItems = filteredMenuItems.filter(function(menuItem, menuItemIndex) {
				
				return (Tools.contains(itemsToShow, menuItem.getItemId()) !== false);
			});
		}
		
		
		// show menu items		
		if (filteredMenuItems && filteredMenuItems.length) {
			
			filteredMenuItems.forEach(function(menuItem) {
				
				menuItem.setVisible(true);
				
				return this;	
			}, $);
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
		
		if (menuItemObjects && menuItemObjects.length) {
			
			menuItemObjects.forEach(function(menuItem) {
				
				menuItem.setVisible(!menuItem.getVisible());
				
				return this;	
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
		
		menuItems.push(options);

		reloadMenu();

		// TODO: Return a menuItem object allowing on/off/remove etc
		return $;
		
	}; // END add()
	
	
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
		
		
		// memory management		
		activity.onCreateOptionsMenu =	null;		
		activity.onPrepareOptionsMenu =	null;
		
		activity =	null;
		win =		null;
		$ =			null;
		
		return;
		
	}; // END destroy()
	
	
	/**
	 * Return menu item object references
	 * 
	 * @public
	 * @method getMenuItems
	 * @return {Ti.Android.MenuItem[]} menuItemObjects
	 */
	$.getMenuItems = function() {
		
		return menuItemObjects;
		
	}; // END getMenuItems()
	
	
	return $;
	
} // END Menu()


// provide public access to module
module.exports = Menu;
