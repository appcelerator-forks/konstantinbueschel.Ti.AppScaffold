/*
 * Storage.js
 *
 * /Resources/model/services/Storage.js
 *
 * This module provides predefined queries to retrieve data from database
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
 * Creates (inserts/updates) new data into database
 *
 * @public
 * @method create
 * @param {String} typeFor
 * @param {Object} data
 * @param {Boolean} createFromRemoteData - optional
 * @return void
 */
exports.create = function(typeFor, data, createFromRemoteData) {

	// check if data argument is given
	if (!data) {

		return;
	}


	// instantiate database provider
	var DatabaseProvider = require('/model/services/DatabaseProvider'),
		Tools = require('/helpers/common/tools'),
	    Globals = require('/helpers/common/globals'),

	    database = new DatabaseProvider(Globals.databaseName);


	// GC
	DatabaseProvider = null;


	// remote
	if (createFromRemoteData === true) {

		_insertFromRemote(typeFor, data, database);
	}
	// data array
	else if (Tools.type(data) === 'array' && data.length) {

		data.forEach(function(dataEntry, index) {

			_insert(typeFor, dataEntry, database);

		}, this);

	}
	// single data record
	else if (Tools.type(data) === 'object') {

		_insert(typeFor, data, database);
	}


	return;

}; // END create()


/**
 * Description
 *
 * @private
 * @method _insert
 * @param {String} table
 * @param {Object} data
 * @param {DatabaseProvider}
 * @return void
 */
function _insert(table, data, database) {

    // generate fieldnames and fieldvalues
	var fields = [],
	    fieldValues = [],
	    fieldPlaceHolders = [],
	    fieldName;


    for (fieldName in data) {

        fields.push(fieldName);
        fieldValues.push(data[fieldName]);
        fieldPlaceHolders.push('?');
    }


	// DEBUG
Ti.API.debug('[Storage]._insert():END', 'REPLACE INTO', table, '(', fields.join(','), ') VALUES (', fieldPlaceHolders.join(','), ');', fieldValues.join(','));


    // fire query
    if (fields.length && fieldValues.length) {

    	database.connect().execute('REPLACE INTO ' + table + ' (' + fields.join(',') + ') VALUES (' + fieldPlaceHolders.join(',') + ');', fieldValues);
    	database.close();
    }


	// GC
	fields = null;
	fieldValues = null;
	fieldPlaceHolders = null;
	filedName = null;


	return;

} // END _insert()


/**
 * Description
 *
 * @private
 * @method _normalize
 * @param {String} typeFor
 * @param {Object} data
 * @return {Object} normalizedData
 */
function _normalize(typeFor, data) {

	// include toolbox
	var Tools = require('/helpers/common/tools');


	// normalize data
	if (data.images && Tools.type(data.images) === 'array') {

		data.images = Tools.stringify(data.images);
	}

	if (data.category_ids && Tools.type(data.category_ids) === 'array') {

		data.category_ids = data.category_ids.join(',');
	}

	if (data.categories && Tools.type(data.categories) === 'array') {

		data.categories = data.categories.join(',');
	}


	// GC
	Tools = null;


	return data;

} // END _normalize()


/**
 * Retrieves data from database
 *
 * @public
 * @method find
 * @param {String} typeFor
 * @param {Object} query
 * @return {Object[]} records
 */
exports.find = function(typeFor, query) {

	if (!typeFor) {

		return;
	}


	// variable declaration
	var records = [],
	    selectQuery,
	    resultset;


	// defaults args
	query = (query || {});


	// include toolbox and database
	var Tools = require('/helpers/common/tools'),
	    DatabaseProvider = require('/model/services/DatabaseProvider'),
	    database = new DatabaseProvider(require('/helpers/common/globals').databaseName);


	switch (typeFor) {

		// FIXME: Dummy method
		case 'example':

			var where = [];
			selectQuery = {};

			if (query.id) {

				where.push('id = "' + query.id + '"');

				selectQuery.limit = 1;
			}

			if (query.limit) {

				selectQuery.limit = query.limit;
			}

			selectQuery.from = database.exampleTable;
			selectQuery.where = where.join(' AND ');
			selectQuery.orderBy = (query.orderBy || 'last_update DESC');

			break;
	}


	// fire storage request
	if (selectQuery && !Tools.isEmptyObject(selectQuery)) {


		if (query && !Tools.isEmptyObject(query)) {

			if (query.category) {

				selectQuery.from = ((database.eventCategoriesMMTable + ' as category_mm_tb, ') + selectQuery.from);
				selectQuery.where = (('event_tb.id = category_mm_tb.event_id AND category_mm_tb.category_id = ' + query.category + ' AND ') + selectQuery.where);
			}

			if (query.date) {

				var Moment = Tools.getMomentProxy();

				selectQuery.where = ('date(event_tb.start, "unixepoch") = "' + Moment.unix(query.date).format('YYYY-MM-DD') + '" AND ' + selectQuery.where);
			}

			if (query.location) {

				if (!selectQuery.from.match(/(as location_tb)/ig)) {

					selectQuery.from = ((database.eventLocationTable + ' as location_tb, ') + selectQuery.from);
				}

				selectQuery.where = (('event_tb.location_id = ' + query.location + ' AND ') + selectQuery.where);
			}
		}


		resultset = database.select(selectQuery);
	}


	// process storage result
	if (resultset) {

	    while (resultset.isValidRow()) {

	        // temp object
	        var tempObj = {};


	        // iterates over columns and add values to temp object
	        for (var i = 0; i < resultset.fieldCount; i++) {

	            tempObj[resultset.fieldName(i)] = resultset.field(i);
	        }


	        // saves temp object in records array
	        if (!Tools.isEmptyObject(tempObj)) {

	        	_extract(typeFor, tempObj);


		        if (typeFor === 'example') {

			        records.push(require('/model/data/Example').createExample(tempObj));
		        }
		        else {

			        records.push(tempObj);
		        }
	        }

	        resultset.next();
	    }


	    // close result set
	    resultset.close();
	    resultset = null;
	}


	// close database connection
	database.close();


	return records;

}; // END find()


/**
 * Removes data from database
 *
 * @public
 * @method remove
 * @param {String} typeFor
 * @param {Object} query
 * @return void
 */
exports.remove = function(typeFor, query) {

	if (!typeFor) {

		return;
	}


	// variable declaration
	var removeQuery;


	// defaults args
	query = (query || {});


	// include toolbox and database
	var Tools = require('/helpers/common/tools'),
	    DatabaseProvider = require('/model/services/DatabaseProvider'),
	    database = new DatabaseProvider(require('/helpers/common/globals').databaseName);


	switch (typeFor) {

		// FIXME: Dummy method
		case 'example':

			var where = [];
			removeQuery = {};

			if (query.id) {

				where.push('id = "' + query.id + '"');
			}

			removeQuery.from = database.exampleTable;
			removeQuery.where = where.join(' AND ');

			break;
	}


	// fire storage request
	if (removeQuery && !Tools.isEmptyObject(removeQuery)) {


		if (query && !Tools.isEmptyObject(query)) {

			if (query.category) {

				removeQuery.from = ((database.eventCategoriesMMTable + ' as category_mm_tb, ') + removeQuery.from);
				removeQuery.where = (('event_tb.id = category_mm_tb.event_id AND category_mm_tb.category_id = ' + query.category + ' AND ') + removeQuery.where);
			}

			if (query.date) {

				var Moment = Tools.getMomentProxy();

				removeQuery.where = ('date(event_tb.start, "unixepoch") = "' + Moment.unix(query.date).format('YYYY-MM-DD') + '" AND ' + removeQuery.where);
			}

			if (query.location) {

				if (!removeQuery.from.match(/(as location_tb)/ig)) {

					removeQuery.from = ((database.eventLocationTable + ' as location_tb, ') + removeQuery.from);
				}

				removeQuery.where = (('event_tb.location_id = ' + query.location + ' AND ') + removeQuery.where);
			}
		}


		// DEBUG
	Ti.API.debug('[Storage].remove():', 'DELETE FROM', removeQuery.from, 'WHERE', removeQuery.where);


		database.connect().execute('DELETE FROM ' + removeQuery.from + ' WHERE ' + removeQuery.where);
	}


	// close database connection
	database.close();


	return;

}; // END remove()


/**
 * Description
 *
 * @private
 * @method _extract
 * @param {String} typeFor
 * @param {Object} data
 * @return {Object} data
 */
function _extract(typeFor, data) {

	// include toolbox
	var Tools = require('/helpers/common/tools');


	// normalize data
	if (data.images && Tools.type(data.images) === 'string') {

		data.images = Tools.parseJSON(data.images);
	}

	if (data.category_ids && Tools.type(data.category_ids) === 'string') {

		data.category_ids = data.category_ids.split(',');
	}

	if (data.categories && Tools.type(data.categories) === 'string') {

		data.categories = data.categories.split(',');
	}

	if (data.recurrings && Tools.type(data.recurrings) === 'string') {

		data.recurrings = data.recurrings.split(',');
	}

	if (data.created) {

		data.created = Number(data.created).toFixed(0).toString();
	}

	if (data.time) {

		data.time = Number(data.time).toFixed(0).toString();
	}

	if (data.last_updated) {

		data.last_updated = Number(data.last_updated).toFixed(0).toString();
	}


	// GC
	Tools = null;


	return data;

} // END _extract()


/**
 * Description
 *
 * @public
 * @method update
 * @param {String} dataUpdateFor
 * @param {Object} dataToUpdate
 * @return void
 */
exports.update = function(dataUpdateFor, dataToUpdate) {

	if (!dataUpdateFor) {

		return;
	}

	// variable declaration
	var Globals = require('/helpers/common/globals'),
	    Tools = require('/helpers/common/tools'),
	    DatabaseProvider = require('/model/services/DatabaseProvider'),

	    database = new DatabaseProvider(Globals.databaseName);


	switch (dataUpdateFor) {

		case Globals.dataSourceTypes.EVENTS:

			// variable declaration
			var fieldValuePairs = [],
			    recordId = dataToUpdate.id;

			delete dataToUpdate.id;


			// value processing
			var recordProperty;

			for (recordProperty in dataToUpdate) {

				var value = dataToUpdate[recordProperty];

				switch (Tools.type(value)) {

					case 'boolean':

						value = (value === true ? 1 : 0);
						break;


					case 'string':

						value = ('\'' + value + '\'');
						break;
				}

				fieldValuePairs.push(recordProperty + ' = ' + value);
			}


			// fire update query
			if (fieldValuePairs.length) {

				database.connect().execute('UPDATE ' + database.eventTable + ' SET ' + fieldValuePairs.join(',') + ' WHERE id = ' + recordId);

				// close database connection
				database.close();
			}

			break;
	}


	// GC
	Tools = null;
	Globals = null;
	DatabaseProvider = null;
	database = null;


	return;

}; // END update()