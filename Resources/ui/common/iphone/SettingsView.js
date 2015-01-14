/*
 * SettingsView.js
 *
 * /Resources/ui/common/iphone/SettingsView.js
 *
 * This module represents an settings view for iPhone
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
 * SettingsView
 *
 * @constructor
 * @param {Map/Dictonary} args
 * @return {SettingsView} this
 */
function SettingsView(args) {

	// import the stylesheet and load required modules
    var Stylesheet =	require('/ui/Stylesheet'),
		Tools =			require('/helpers/common/tools'),

		_styles =		new Stylesheet();

	this.stylesheet =	_styles.init();


	// merge options
	args = (args || {});

	var _androidMenu = args.menu;

	delete args.menu;

	this.options = Tools.merge({

		emptyView: undefined

	}, args);


	// variable initialization
	this._isInitialzed = false;
	this.isFetchingData = false;

    this.sections =	[];


	// protect context
	var _self = this;


	// create element container
	this.viewProxy = Ti.UI.createView(this.stylesheet.settingsView.viewProxy);


	// create listview
    this.listView = Ti.UI.createTableView(this.stylesheet.settingsView.listView);

	this.viewProxy.add(this.listView);


	/**
	 * App property change callback - reloads settings
	 *
	 * @private
	 * @method _onAppPropertyChange
	 * @return void
	 */
	this._onAppPropertyChange = function() {

		// reload settings
		_self._doRefresh();

		return;

	}; // END _onAppPropertyChange()


	/**
	 * Handles changes to settings from this view
	 *
	 * @private
	 * @param {Dictonary} args
	 * @return void
	 */
	this._handleSettingChange = function(args) {

		// default args
		args = (args || {});


		var Tools = require('/helpers/common/tools'),
			property = args.property,
		    propertyValue = args.propertyValue;


		if (property && Tools.type(propertyValue) !== 'undefined') {


			// temporary remove app property change listener
			// otherwise it would be triggered on property change
			require('/helpers/app/EventDispatcher').off('app:propertyChange', this._onAppPropertyChange);


			// save change off property
			switch (Tools.type(propertyValue)) {

				case 'boolean':

					Tools.saveDataPersistent({
						type:     'Bool',
						property: property,
						data:     propertyValue
					});

					break;


				case 'number':

					Tools.saveDataPersistent({
						type:     'Double',
						property: property,
						data:     propertyValue
					});

					break;


				case 'string':

					Tools.saveDataPersistent({
						type:     'String',
						property: property,
						data:     propertyValue
					});

					break;
			}


			// protect context
			var self = this;


			// fire analytics event
			require('/helpers/analytics/ga').event(L('analyticsEventCategoryInAppSettings'), L('analyticsEventActionChange'), args.propertyTitle, Number(propertyValue));


			// add app property change listener back
			// but wait a litte bit, otherwise the property
			// change would trigger the handler
			setTimeout(function() {

				require('/helpers/app/EventDispatcher').on('app:propertyChange', self._onAppPropertyChange);

				// GC
				self = null;

				return;

			}, (0.5 * 1000));
		}


		return;

	}; // END _handleSettingChange()


	/**
	 * ViewProxy postlayout callback
	 *
	 * @private
	 * @method _afterLayout
	 * @param {Object} afterLayoutEvent
	 * @return void
	 */
	this._afterLayout = function(afterLayoutEvent) {

		// remove event listener
		this.removeEventListener(afterLayoutEvent.type, _self._afterLayout);


		// load settings
		_self.load();


		// add settings reload event listener
		require('/helpers/app/EventDispatcher').on('app:propertyChange', _self._onAppPropertyChange);


		// fire tracking event
		require('/helpers/analytics/ga').screen(L('windowTitleSettings'));


		// GC
		_self._afterLayout = null;


		return;

	}; // END _afterLayout()


	/**
	 * List item click callback
	 *
	 * @private
	 * @method _onListItemSelected
	 * @param {Object} itemSelectedEvent
	 * @return void
	 */
	this._onListItemSelected = function(itemSelectedEvent) {

		if (itemSelectedEvent && itemSelectedEvent.row) {

			switch (itemSelectedEvent.row.className) {

				case _self.stylesheet.settingsView.rows.supportRow.className:

					require('/helpers/common/tools').navigateApp({

						action: require('/helpers/common/globals').action.HANDLE_SUPPORT_REQUEST
					});

					break;
			}
		}


		return;

	}; // END _onListItemSelected()


    // add list item click callback
	this.listView.addEventListener('postlayout', this._afterLayout);
	this.listView.addEventListener('click', this._onListItemSelected);


	return this;

} // END SettingsView()


/**
 * Populates list view with rows
 *
 * @public
 * @method populate
 * @param {Array} rowData
 * @return void
 */
SettingsView.prototype.populate = function(rowData) {

	// load toolbox
	var Tools = require('/helpers/common/tools');


	if (Tools.type(rowData) === 'array' && rowData.length) {

		// create sections with rows
		this.sections= this.createSections(rowData);


		// hide loading view
		this.hideLoadingView();


		// set new sections
		this.listView.setData(this.sections);


    	// enable list view scrolling
    	this.listView.setScrollable && this.listView.setScrollable(true);
	}


	// shows up emptyView if no sections given
	if (!this.sections.length) {

		this._showEmptyView();
	}

	return;

}; // END populate()


/**
 * Shows loading view
 *
 * @public
 * @method showLoadingView
 * @return void
 */
SettingsView.prototype.showLoadingView = function() {

	if (!this.isFetchingData) {

		if (!this.loadingView) {

			// create loading view container, create loading spinner and at it to loading container
			this.loadingView = Ti.UI.createView(this.stylesheet.settingsView.loadingView);

			var loadingSpinner = Ti.UI.createActivityIndicator(this.stylesheet.settingsView.loadingSpinner);

			this.loadingView.add(loadingSpinner);

			loadingSpinner.show();

			loadingSpinner = null;


			// add both to view proxy
			this.viewProxy.add(this.loadingView);
		}


		// shows up loading view
		this.loadingView.show();
	}

	return;

}; // END showLoadingView()


/**
 * Hides loading view
 *
 * @public
 * @method hideLoadingView
 * @return void
 */
SettingsView.prototype.hideLoadingView = function() {

	if (this.loadingView) {

		this.loadingView.hide();
	}

	return;

}; // END hideLoadingView()


/**
 * Creates table view sections with rows from given data
 *
 * @public
 * @method createSections
 * @param {Array} rowData
 * @return {Ti.UI.TableViewRowSection[]} section
 */
SettingsView.prototype.createSections = function(rowData) {

	var sections = [],
	    lastHeaderTitle = '',

	    Tools = require('/helpers/common/tools'),
		section;


	if (Tools.type(rowData) === 'array' && rowData.length) {

		rowData.forEach(function(singleRowData, index) {

			// define row options
			var rowOptions = this.stylesheet.settingsView.rows.row,
			    dataHeader = singleRowData.header;


			// create section, push it to reference array and update
			// last header title, if rows have different header title
			if (dataHeader && dataHeader !== lastHeaderTitle) {

				section = Ti.UI.createTableViewSection({

					headerTitle: dataHeader
				});

				// push section into reference array
				sections.push(section);

				lastHeaderTitle = dataHeader;
			}


			if (singleRowData.footer) {

				var footerView = Ti.UI.createView({

					width:  Ti.UI.SIZE,
					height: 50,

					layout: 'vertical'
				});

				footerView.add(Ti.UI.createLabel({

					text:      singleRowData.footer,
					textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
					color:     '#6d6d72',

					font: {
						fontSize: 14
					},

					top:  5,
					left: 15
				}));

				section.footerView = footerView;
			}


			rowOptions.title = singleRowData.title;


			// create row
			var row = Ti.UI.createTableViewRow(rowOptions);


			// create settings input
			var Tools = require('/helpers/common/tools'),
			    defaultValue = singleRowData.defaultValue,
			    self = this;


			switch (Tools.type(defaultValue)) {

				case 'boolean':

					var propertyValue = Tools.getPersistentData({

						    type:        'Bool',
						    property:    singleRowData.property,
						    defaultData: defaultValue
					    }),

					    toggle = Ti.UI.createSwitch(Tools.combine(this.stylesheet.settingsView.rows.switch, {

						    value:    propertyValue,
						    property: singleRowData.property
					    }));


					if (Tools.isAndroid) {

						toggle.setTouchEnabled(!!singleRowData.editable);
					}
					else {

						toggle.setEnabled(!!singleRowData.editable);
					}

					row.add(toggle);

					toggle.addEventListener('change', function(changeEvent) {

						self._handleSettingChange({

							property:      this.property,
							propertyValue: this.getValue(),
							propertyTitle: singleRowData.title
						});

						return;
					});

					break;


				case 'string':

					var propertyValue = Tools.getPersistentData({

						    type:        'String',
						    property:    singleRowData.property,
						    defaultData: defaultValue
					    }),

					    textField = Ti.UI.createTextField(Tools.combine(this.stylesheet.settingsView.rows.textField, {

						    value:    propertyValue,
						    editable: !!singleRowData.editable,
						    property: singleRowData.property
					    }));


					row.add(textField);


					if (!!singleRowData.editable) {

						textField.setColor(this.stylesheet.settingsView.rows.textField.color)

						textField.addEventListener('blur', function(blurEvent) {

							self._handleSettingChange({

								property:      this.property,
								propertyValue: this.getValue()
							});

							return;
						});
					}
					else {

						textField.setColor(this.stylesheet.settingsView.rows.textField.disabledColor);
					}

					break;


				case 'number':
					break;


				case 'int':
					break;
			}


			// add row to section
			section.add(row);


			// GC
			row = null;
			rowOptions = null;


			return;

		}, this);


		// create row and push it into reference array
		var supportSection = Ti.UI.createTableViewSection({

			headerTitle: L('settingsHeaderSupport')
		});

		supportSection.add(Ti.UI.createTableViewRow(this.stylesheet.settingsView.rows.supportRow));

		sections.push(supportSection);
	}


	// GC
	lastHeaderTitle = null;
	Tools = null;


	return sections;

}; // END createSections()


/**
 * Process rows load
 *
 * @public
 * @method load
 * @param {Function} loadCallback
 * @return void
 */
SettingsView.prototype.load = function(loadCallback) {

	if (!this.isFetchingData) {

		this._doRefresh(loadCallback);
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
SettingsView.prototype._doRefresh = function(loadCallback) {

	// process reload/refresh
	this._doLoad(loadCallback);

	return;

}; // END _doRefresh()


/**
 * Load data
 *
 * @private
 * @method _doLoad
 * @parma {Function} loadCallback
 * @return void
 */
SettingsView.prototype._doLoad = function(loadCallback) {

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
	this.showLoadingView();


	// set loading state
	this.isFetchingData = true;


	// load toolbox
	var Tools = require('/helpers/common/tools');


	// 	fetch alarm clocks
	result = {

		data: {

			items: require('/helpers/common/globals').FIXTURES.settings
		}
	};


	// execute callback if given
	if (loadCallback) {

		loadCallback(true);
	}


	// parse data objects
	var resultObjects;

	if (result) {

		switch (Tools.type(result.data)) {

			case 'object':

				resultObjects = result.data.items;
				break;

			case 'array':

				resultObjects = result.data;
				break;
		}
	}


	// populate list view
	this.populate(resultObjects);


	// update loading state
	this.isFetchingData = false;

	// update init state
	this._isInitialzed = true;

	// enable scrolling of list view
	this.listView.setScrollable && this.listView.setScrollable(true);


	return;

}; // END _doLoad()


/**
 * Clear instance
 *
 * @public
 * @method destroy
 * @return void
 */
SettingsView.prototype.destroy = function() {

	// remove event listener
	require('/helpers/app/EventDispatcher').off('app:propertyChange', this._onAppPropertyChange);

	this.listView.removeEventListener('click', this._onListItemSelected);


	// remove views
	this.viewProxy.removeAllChildren();


	// GC
	this._onAppPropertyChange = null;
	this._onListItemSelected = null;


	return;

}; // END destroy()


/**
 * Factory method for SettingsView
 *
 * @public
 * @method createView
 * @param {Dictonary} args
 * @return {SettingsView}
 */
exports.createView = function(args) {

	return new SettingsView(args);

}; // END createView()
