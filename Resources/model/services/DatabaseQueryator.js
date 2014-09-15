/*
 * Hessentag 2014
 * 
 * DatabaseQueryator.js
 * 
 * /Resources/model/services/DatabaseQueryator.js
 * 
 * This module provides predefined queries to retrieve data from database
 * 
 * Author:		kbueschel
 * Date:		2014-06-05
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
    var DatabaseProvider =  require('/model/services/DatabaseProvider'),
        globals =           require('/helpers/common/globals'),
        
        database =          new DatabaseProvider(globals.global.databaseName);
	
	
	// memory management
	DatabaseProvider = null; 
		
	
	// include toolbox
	var Tools = require('/helpers/common/tools');
	
	
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
 * @method _insertFromRemote
 * @param {String} typeFor 
 * @param {Object} data 
 * @param {DatabaseProvider} database
 * @return void 
 */
function _insertFromRemote(typeFor, data, database) {
	
	var globals = require('/helpers/common/globals').global;
	
	switch (typeFor) {
		
		// events
		case globals.dataSourceTypes.EVENTS:
			
			var tableMapping = {
				
					'categories': 	database.eventCategoriesTable,
					'locations': 	database.eventLocationTable,
					'events': 		database.eventTable
				},
				
				dataType;
	

			for (dataType in data) {
				
				data[dataType].forEach(function(dataEntry, index, collection) {
					
					
					// insert belongs to many relationship
					if (dataType === 'events' && dataEntry.category_ids) {
						
						dataEntry.category_ids.forEach(function(categoryID, index) {
							
							_insert(database.eventCategoriesMMTable, {category_id: categoryID, event_id: dataEntry.id}, database);
													
						}, this);
					}
					
					
					// normalize data for storage
					dataEntry = _normalize(typeFor, dataEntry);
					
					
					// insert record					
					_insert(tableMapping[dataType], dataEntry, database);
					
				}, this);
				
				
				// close database connection
				database.close();
			}
			
			
			// include toolbox
			var Tools = require('/helpers/common/tools');
			
			
			// insert last update time
			_insert(database.dataUpdateTable, {
			
				modul:		typeFor,
				lastupdate:	Tools.getNow() 
				
			}, database);
			
			break;
			
			
		// news
		case globals.dataSourceTypes.NEWS:
			
			var tableMapping = {
					
					'categories': 	database.newsCategoriesTable,
					'news': 		database.newsTable
				},
				
				dataType;


			for (dataType in data) {
				
				// load toolbox
				var Tools = require('/helpers/common/tools');
				
				
				if (Tools.type(data[dataType]) === 'array') {
				
					data[dataType].forEach(function(dataEntry, index, collection) {
						
						
						// insert belongs to many relationship
						if (dataType === 'news' && dataEntry.categories) {
							
							dataEntry.categories.forEach(function(categoryID, index) {
								
								_insert(database.newsCategoriesMMTable, {category_id: categoryID, news_id: dataEntry.id}, database);
														
							}, this);
						}
						
						
						// normalize data for storage
						dataEntry = _normalize(typeFor, dataEntry);
						
						
						// insert record					
						_insert(tableMapping[dataType], dataEntry, database);
						
					}, this);
									
				}
				
				
				// close database connection
				database.close();
			}
			
				
			// include toolbox
			var Tools = require('/helpers/common/tools');
			
			
			// insert last update time
			_insert(database.dataUpdateTable, {
			
				modul:		typeFor,
				lastupdate:	Tools.getNow() 
				
			}, database);
			
			break;
			
			
		// image galleries
		case globals.dataSourceTypes.IMAGE_GALLERIES:
			
			// empty table
			database.connect().execute('DELETE FROM ' + database.imageGalleriesTable);
						
			for (dataType in data) {
				
				var dataEntry = data[dataType];
				
				// normalize data for storage
				dataEntry = _normalize(typeFor, dataEntry);
				
				// insert record					
				_insert(database.imageGalleriesTable, dataEntry, database);	
				
				
				// close database connection
				database.close();
			}
			
			
			// include toolbox
			var Tools = require('/helpers/common/tools');
			
			
			// insert last update time
			_insert(database.dataUpdateTable, {
			
				modul:		typeFor,
				lastupdate:	Tools.getNow() 
				
			}, database);
			
			break;
			
			
		// faq
		case globals.dataSourceTypes.HELP:
			
			var tableMapping = {
					
					'categories': 	database.faqCategoriesTable,
					'questions': 	database.faqTable
				},
				
				dataType;

			
			// empty table
			database.connect().execute('DELETE FROM ' + database.faqTable);
			database.connect().execute('DELETE FROM ' + database.faqCategoriesTable);

			
			for (dataType in data) {
				
				var Tools =		require('/helpers/common/tools'),
					dataArray =	data[dataType];
				
				
				// iterate over data to insert				
				dataArray.forEach(function(dataEntry, index, collection) {
					
					
					// insert belongs to many relationship
					if (dataType === 'questions' && dataEntry.category_ids) {
						
						dataEntry.category_ids.forEach(function(categoryID, index) {
							
							_insert(database.faqCategoriesMMTable, {category_id: categoryID, faq_id: dataEntry.id}, database);
													
						}, this);
					}
					
					
					// normalize data for storage
					dataEntry = _normalize(typeFor, dataEntry);
					
					
					// insert record					
					_insert(tableMapping[dataType], dataEntry, database);
					
				}, this);
				
				
				// close database connection
				database.close();
			}
			
			
			// include toolbox
			var Tools = require('/helpers/common/tools');
			
			
			// insert last update time
			_insert(database.dataUpdateTable, {
			
				modul:		typeFor,
				lastupdate:	Tools.getNow() 
				
			}, database);
			
			break;
	}
	
	return;
	
} // END _insertFromRemote()


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
    var fields =			[],
        fieldValues =		[],
        fieldPlaceHolders =	[],
        fieldName;
    
    
    for (fieldName in data) {
        
        fields.push(fieldName);
        fieldValues.push(data[fieldName]);
        fieldPlaceHolders.push('?');
    }

    
    // fire query
    if (fields.length && fieldValues.length) {
    	
    	database.connect().execute('REPLACE INTO ' + table + ' (' + fields.join(',') + ') VALUES (' + fieldPlaceHolders.join(',') + ');', fieldValues);
    	database.close();
    }


	// memory management
	fields =			null;
	fieldValues =		null;
	fieldPlaceHolders =	null;
	filedName =			null;
	
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
	
	
	// memory management
	Tools = null;
	
			
	return data;
	
} // END _normalize()


/**
 * Description
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
	var globals =	require('/helpers/common/globals').global,
		records =	[],
		selectQuery,
		resultset;
	
	
	// include toolbox and database
	var Tools =				require('/helpers/common/tools'),
		DatabaseProvider =	require('/model/services/DatabaseProvider'),
		
		database =			new DatabaseProvider(globals.databaseName);
	
	
	switch (typeFor) {
		
		// news
		case globals.dataSourceTypes.NEWS:
			
		    selectQuery = {
		    	
		    	from:		database.newsTable,
		    	orderBy:	'timestamp DESC',
		    	limit:		'25'
		    };
		    
			break;

			
		// image galleries
		case globals.dataSourceTypes.IMAGE_GALLERIES:
			
		    selectQuery = {
		    	from:	database.imageGalleriesTable
		    };
		
			break;
			
		
		// faq	
		case globals.dataSourceTypes.HELP:
		
		    selectQuery = {
		    	from:	database.faqTable
		    };
		
			break;
			
		
		// events	
		case 'events':
			
			// all events without filter
		    selectQuery = {
		    	
		    	select:		'event_tb.id, event_tb.title, event_tb.start, event_tb.end, event_tb.images, event_tb.description, event_tb.description_plain, event_tb.ticket_link, event_tb.starred, location_tb.name as locationname',
		    	from:		(database.eventTable + ' as event_tb'),
		    	where:		'event_tb.location_id = location_tb.id',
		    	groupBy:	'event_tb.id',
		    	orderBy:	'trim(trim(lower(event_tb.title), \'"\'), "\'") ASC'
		    };
		    
			
			if (!selectQuery.from.match(/(as location_tb)/ig)) {

				selectQuery.from = (selectQuery.from + ', ' + database.eventLocationTable + ' as location_tb');
			}
		    
			break;
			
		
		case 'event_categories':
		
			// all event categories without filter
		    selectQuery = {
		    	
		    	select:		'DISTINCT category_tb.id, category_tb.title as cat_title',
		    	from:		(database.eventCategoriesTable + ' as category_tb, ' + database.eventTable + ' as event_tb,' + database.eventCategoriesMMTable + ' as category_mm_tb'),
		    	where:		'event_tb.id = category_mm_tb.event_id AND category_mm_tb.category_id = category_tb.id',
		    	orderBy:	'trim(trim(lower(cat_title), \'"\'), "\'") ASC'
		    };
		
			break;
			
			
		case 'event_dates':
		
			// all event dates without filter
		    selectQuery = {
		 		
		    	select:		'strftime("%s", date(start, "unixepoch")) as day',
		    	from:		(database.eventTable + ' as event_tb'),
		    	where:		'day > strftime("%s", "2014-06-04") AND day < strftime("%s", "2014-06-17")',
		    	groupBy:	'day',
		    	orderBy:	'day ASC'
		    };
			
			break;
			
			
		case 'event_locations':
			
			// all event locations without filter
		    selectQuery = {

		    	select:		'DISTINCT location_tb.id as locationid, location_tb.name as locationname',
		    	from:		(database.eventTable + ' as event_tb, ' + database.eventLocationTable + ' as location_tb '),
		    	where:		'event_tb.location_id = location_tb.id',
		    	orderBy:	'trim(trim(lower(locationname), \'"\'), "\'") ASC'
		    };
			
			break;


		case 'event_favorites':
			
			selectQuery = {
				
				select:		'event_tb.id, event_tb.title, event_tb.start, event_tb.end, event_tb.images, event_tb.description, event_tb.description_plain, event_tb.ticket_link, event_tb.starred, location_tb.name as locationname', 
				from:		(database.eventTable + ' as event_tb, ' + database.eventLocationTable + ' as location_tb'),
				where:		'starred = 1 AND event_tb.location_id = location_tb.id',
				groupBy:	'event_tb.id',
				orderBy:	'start ASC, trim(trim(lower(title), \'"\'), "\'") ASC',
			};
			
			break; 
			
			
		case 'starred_next_events':
		
			selectQuery = {
				
				select:		'event_tb.id, event_tb.title, event_tb.start, event_tb.end, event_tb.images, event_tb.description, event_tb.description_plain, event_tb.ticket_link, event_tb.starred, location_tb.name as locationname', 
				from:		(database.eventTable + ' as event_tb, ' + database.eventLocationTable + ' as location_tb'),
				where:		('starred = 1 AND event_tb.location_id = location_tb.id AND start > ' + Tools.getNow()),
				orderBy:	'start ASC, trim(trim(lower(title), \'"\'), "\'") ASC',
				limit:		(query.limit ? query.limit.toString() : undefined)
			};
			
			break;
	
	
		case 'next_events':
		
			var categorySelectQuery = {
				
				select:		'id, title',
				from:		database.eventCategoriesTable,
				where:		('id IN (SELECT category_id FROM ' + database.eventCategoriesMMTable + ' GROUP BY category_id HAVING COUNT(category_id) > 0)'),
				orderBy:	'RANDOM()',
				limit:		'1'
			};
			
			
			var categoryResultset = database.select(categorySelectQuery),
				categoryID;
			
			if (categoryResultset.isValidRow()) {
				
				categoryID = categoryResultset.fieldByName('id');
				
				categoryResultset.close();
			}
			
			
			if (categoryID) {
				
				selectQuery = {
				
					select:		'event_tb.id, event_tb.title, event_tb.start, event_tb.end, event_tb.images, event_tb.description, event_tb.description_plain, event_tb.ticket_link, event_tb.starred, location_tb.name as locationname',
					 
					from:		(database.eventTable + ' as event_tb, ' + database.eventLocationTable + ' as location_tb'),
					
					where:		('event_tb.location_id = location_tb.id AND event_tb.id IN (SELECT event_id FROM ' + database.eventCategoriesMMTable + ' WHERE category_id = ' + categoryID + ') AND start > ' + Tools.getNow()),
					
					orderBy:	'start ASC, trim(trim(lower(title), \'"\'), "\'") ASC',
					limit:		(query.limit ? query.limit.toString() : undefined)
				};
			}
		
			break;	
			
			
		case 'last_update_time':
		
			selectQuery = {
				
				select:		'lastupdate', 
				from:		database.dataUpdateTable,
				where:		'modul = "' + query.typeFor + '"',
				orderBy:	'ROWID DESC',
				limit:		'1'
			};
			
			delete query.typeFor;
			
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
				
				var Moment = require('/helpers/date/moment');
				
				Moment.lang(Ti.Locale.getCurrentLanguage());
				
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
		
		var Tools = require('/helpers/common/tools');
		    
	    while (resultset.isValidRow()) {
	        
	        // TempObj für Account                
	        var tempObj = {};
	        
	        // Feldanzahl holen
	        if (Tools.isIOS) {
	            var fieldCount = resultset.fieldCount();
	        }
	        else if (Tools.isAndroid) {
	            var fieldCount = resultset.fieldCount;
	        }
	        
	        // Über Felder iterieren und Values in TempObjekt speichern                         
	        for (var i = 0; i < fieldCount; i++) {
	            
	            tempObj[resultset.fieldName(i)] = resultset.field(i);
	        }
	        
	        // TempObj speichern
	        if (!Tools.isEmptyObject(tempObj)) {
	        	
	        	_extract(typeFor, tempObj);
	        	
	            records.push(tempObj);                    
	        }
	        
	        resultset.next();               
	    }
	        
	    // Resultset schließen
	    resultset.close();
	    resultset = null;
	}
	
	
	// close database connection definetly
	database.close();
	
	
	return records;
	
}; // END find()


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
	
	
	// memory management
	Tools = null;
	
			
	return data;
	
}; // END _extract()


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
	var globals = require('/helpers/common/globals').global;
	
	
	// include toolbox and database
	var Tools =				require('/helpers/common/tools'),
		DatabaseProvider =	require('/model/services/DatabaseProvider'),
		
		database =			new DatabaseProvider(globals.databaseName);
	
	
	switch (dataUpdateFor) {
		
		case globals.dataSourceTypes.EVENTS:
			
			// variable declaration
			var fieldValuePairs = 	[],
				recordId =			dataToUpdate.id;
				
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
	
	
	return;
	
}; // END update()


/**
 * Description
 * 
 * @public
 * @method remove
 * @param {String} removeDataFrom
 * @param {Object} dataToRemove
 * @return void
 */
exports.remove = function(removeDataFrom, datatToRemove) {
	
	return;
	
}; // END remove()
