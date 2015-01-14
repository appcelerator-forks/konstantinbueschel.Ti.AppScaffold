/*
 * CheckBox.js
 *
 * /Resources/ui/common/default/CheckBox.js
 *
 * This module represents a checkbox
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
 * CheckBox
 *
 * @constructor
 * @method CheckBox
 * @param {Map/Dictonary} args
 * @return void
 */
function CheckBox(args) {

	// import stylesheet
	var Stylesheet =	require('/ui/Stylesheet'),
		Tools =			require('/helpers/common/tools'),

		_styles =		new Stylesheet(),
		_stylesheet =	_styles.init();


	// merge options
	this._options = Tools.merge({

		value:   false,
		checked: false,
		label:   '',

		unselectedTitle: '\u2713',
		selectedTitle:   '\u2713',

		selectedColor: '#ffffff',

		unselectedBackgroundColor: '#ffffff',
		selectedBackgroundColor:   '#4ead54'

	}, args);


	// variable initialization
	this.value = this._options.value;
	this.checked = this._options.checked;

	if (require('/helpers/common/tools').type(this.value) === 'boolean') {

		this.value = this.checked;
	}


	// protect context
	var self = this;


	// create element container
	this.viewProxy = Ti.UI.createView(_stylesheet.checkBox.viewProxy);


	// create checkbox
	this._checkBox = Ti.UI.createButton(_stylesheet.checkBox._checkBox);

	this._checkBox.setTitle(this._options.unselectedTitle);

	this.viewProxy.add(this._checkBox);

	this._checkBox.addEventListener('singletap', _toggle);


	// create checkbox label if given
	if (this._options.label && this._options.label.length) {

		this._checkBoxLabel = Ti.UI.createLabel(_stylesheet.checkBox._checkBoxLabel);

		this._checkBoxLabel.setText(this._options.label);

		this.viewProxy.add(this._checkBoxLabel);

		this._checkBoxLabel.addEventListener('singletap', _toggle);
	}


	// init elements with state
	_toggle(this.checked, false);



	/**
	 * Toggles checkbox state and UI
	 *
	 * @private
	 * @method _toggle
	 * @param {Boolean} value - optional: force a particular state
	 * @param {Boolean} triggerCallback - optional: Defaults to true
	 * @return void
	 */
	function _toggle(value, triggerCallback) {

		// update checked state
		if (value === true || value === false) {

			self.checked = value;
		}
		else {

			self.checked = !self.checked;
		}


		// mark button as checked
		self._checkBox.setTitle(self.checked ? self._options.selectedTitle : self._options.unselectedTitle);
		self._checkBox.setBackgroundColor(self.checked ? self._options.selectedBackgroundColor : self._options.unselectedBackgroundColor);
		self._checkBox.setBorderWidth(self.checked ? 0 : 1);


		if (self._options.callback && triggerCallback !== false) {

			self._options.callback(self.checked, self.value, self._options.label);
		}


		// update value if it is boolean
		if (require('/helpers/common/tools').type(self.value) === 'boolean') {

			self.value = self.checked;
		}

		return;

	} // END _toggle()


	// release vars
	Stylesheet = null;
	_styles = null;
	Tools = null;
	_stylesheet = null;


	return this;

} // END CheckBox()


// provide public access to module
module.exports = CheckBox;
