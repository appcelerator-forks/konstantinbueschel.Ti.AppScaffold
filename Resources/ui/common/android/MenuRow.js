/*
 * MenuRow.js
 *
 * /Resources/stylesheets/android/MenuRow.js
 *
 * This module provides a menu row for the menu view
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
 * MenuRow
 *
 * @constructor
 * @param {Map/Dictonary} args
 * @return {MenuRow} this
 */
function MenuRow(args) {

	// load toolbox
	var Tools = require('/helpers/common/tools');


	// merge arguments
	var options = Tools.merge({

		viewProxy: {

			action: ''
		},

		container: {},

		title: {

			title:  'Row'
		}

	}, args);


	// create row
	this.viewProxy = Ti.UI.createTableViewRow(options.viewProxy);


	// create container
	this._container = Ti.UI.createView(options.container);

	this.viewProxy.add(this._container);


	// create label
	this._title = Ti.UI.createLabel(options.title);

	this._container.add(this._title);


	return this;

} // END MenuRow()


/**
 * Apply properties from Ti.UI.View
 *
 * @public
 * @method applyProperties
 * @param {Map/Dictonary} properties
 * @return void
 */
MenuRow.prototype.applyProperties = function(properties) {

	if (this._container && this._title) {

		var property,
		    self = this;

		for (property in properties) {

			if (self._container.hasOwnProperty(property)) {

				self._container[property] = properties[property];
			}
			else if (self._title.hasOwnProperty(property)) {

				self._title[property] = properties[property];
			}
		}
	}

	return;

}; // END applyProperties()


/**
 * Selects row
 *
 * @public
 * @method select
 * @return void
 */
MenuRow.prototype.select = function() {

	this._container.setBackgroundColor(this.viewProxy.selectedBackgroundColor);
	this._title.setColor(this.viewProxy.selectedColor);

	return;

}; // END select()


/**
 * Deselects row
 *
 * @public
 * @method deselect
 * @return void
 */
MenuRow.prototype.deselect = function() {

	this._container.setBackgroundColor(this.viewProxy.backgroundColor);
	this._title.setColor(this.viewProxy.color);

	return;

}; // END deselect()


// provide public access
module.exports = MenuRow;