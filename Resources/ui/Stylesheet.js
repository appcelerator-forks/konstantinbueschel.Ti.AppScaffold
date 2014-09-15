/*
 * Stylesheet.js
 * 
 * This module the styles/layout/themes for the app
 * 
 * Author:  Konstantin Büschel
 * Date:    14-04-2014
 * 
 * Maintenance Log
 * 
 * Author:
 * Date:
 * Changes:
 * 
 */

/**
 * Stylesheet module
 * 
 * @constructor
 * @return {Stylesheet} this
 */
function Stylesheet() {
	
	this.stylesheet = {};
	
	return this;
	
} // END Stylesheet()


/**
 * Init the stylesheet
 * 
 * @public
 * @method init
 * @param {String} name
 * @return {Stylesheet} this.stylesheet
 */
Stylesheet.prototype.init = function(name){    

	// require Tools module
	var Tools = require('/helpers/common/tools');

	// include the common styles
	var device = 			Tools.osname.toLowerCase(),
		
		StylesheetCommon = 	require('/stylesheets/common/' + device);
		
		this.stylesheet =	new StylesheetCommon();


	// include file specific styles
	if (Tools.type(name) === 'string' && name.length) {
		
		var StylesheetDevice = 	require('/stylesheets/' + device + '/' + name);
		this.stylesheet = 		Tools.merge(this.stylesheet, new StylesheetDevice(this.stylesheet));
	}

	//return the final stylesheet object
	return this.stylesheet;
    
}; // END init()


// Provide public access to CommonJS module
module.exports = Stylesheet;
