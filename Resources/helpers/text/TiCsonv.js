/*
 * TiCsonv.js
 *
 * /Resources/helpers/text/TiCsonv.js
 *
 * This module is a helper for CSV file operations
 *
 * Author:  kbueschel
 * Date:    2015-01-09
 *
 * Maintenance Log
 *
 * Author:
 * Date:
 * Changes:
 *
 */

if (typeof(Csonv) == "undefined") {

// *
// * csonv.js {version} (Uncompressed)
// * A tiny library to fetch relational CSV data at client-side just like JSON
// *
// * (c) {year} Paul Engel (Internetbureau Holder B.V.)
// * Except otherwise noted, csonv.js is licensed under
// * http://creativecommons.org/licenses/by-sa/3.0
// *
// * $Date: {date} $
// *

Csonv = (function(undefined) {

  var parsers = null, cache = {};

  var defineParsers = function() {

    var n = function(type, values) {

      var strings = values.csvSplit(Csonv.separators.array);
      var array   = [];

      for (var i = 0; i < strings.length; i++) {
        array.push(parsers[type](strings[i]));
      }
      return array;
    };

    // Date Library Laden
    if (!moment) {
        var moment = require('/helpers/date/moment');
    }

    moment.lang(Ti.Locale.currentLanguage);

    parsers = {

      "string": function(value) {
        return value.toString();
      },

      "integer": function(value) {
        return parseInt(value, 10);
      },

      "float": function(value) {

        var parsedValue = parseFloat(value).toFixed(2);

        if (isNaN(parsedValue)) {
            parsedValue = '';
        }

        return parsedValue;
      },

      "boolean": function(value) {
        return parseInt(value, 10) == 1;
      },

      "date": function(value) {

        if (moment && value && value.length) {
            return moment(value, 'DD.MM.YYYY').toJSON();
        }
        else {
            return new Date(value);
        }
      },

      "strings": function(value) {
        return n("string", value);
      },

      "integers": function(value) {
        return n("integer", value);
      },

      "floats": function(value) {
        return n("float", value);
      },

      "booleans": function(value) {
        return n("boolean", value);
      },

      "dates": function(value) {
        return n("date", value);
      },

      "relation": function(ids, type, url, id) {
        var assoc     = type.split(":");
        var assoc_url = resolvePath(url, assoc[0] + ".csv");
        var array     = [];

        assoc_url.toObjects();
        var map = cache[assoc_url].map;

        if (assoc[2]) {
          for (var key in map) {
            var object_map = map[key];
            if ((object_map[assoc[2]] || []).indexOf(id.toString()) != -1) {
              array.push(object_map._object);
            }
          }
        } else {
          for (var i = 0; i < ids.length; i++) {
            var object_map = map[parseInt(ids[i], 10)];
            if (object_map) {
              array.push(object_map._object);
            }
          }
        }

        return parseInt(assoc[1], 10) == 1 ? array[0] || null : array;
      }
    };
  };

  var resolvePath = function(url, relative) {

    url = url.replace(/[^\/]+\/?$/, "") + relative;
    reg_exp = new RegExp(/[^\/]+\/\.\.\/?/);

    while (url.match(reg_exp)) {
      url = url.replace(reg_exp, "");
    }

    return url;
  };


  /*
   * Added for Titanium to read from local files
   */
  var readFile = function(url) {

  	var f = Titanium.Filesystem.getFile(url);

 	if (f.exists()) {
 		return String(f.read());
 	}
 	else {
 		return {};
 	}

  };


  var toObjects = function(data, url) {

    cache[url] = {
      data: [],
      map : {}
    };


    var $ = cache[url],
    	lineBreakMatch = data.match(/(\r|\r\n|\n|\n\r)/gi),
    	lineBreak = '\n';

    if (lineBreakMatch && lineBreakMatch.length) {

    	lineBreak = lineBreakMatch[0];
    }

	rows = data.split(lineBreak);


    // remove empty rows
    if (rows.length) {

        var Tools = require('/helpers/common/tools');

        rows = rows.filter(function(row, index, arrayObject) {

            return (Tools.type(row) == "string" && row.trim().length && row.trim().length > 4);
        });
    }


    var keys  = String(rows.shift()).csvSplit(),
        types = String(rows.shift()).csvSplit();

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i].csvSplit(), object = {}, object_map = {};

      for (var j = 0; j < keys.length; j++) {
        var key = keys[j], type = types[j], parser = parsers[type];

        if (parser) {
          object[key] = parser(row[j], type, url);
        } else {
          object_map[key] = type.split(":").length == 2 ? row[j].split(Csonv.separators.array) : null;
        }
      }

      if (object.id) {
        object_map._object = object;
        $.map[object.id]   = object_map;
      }
      $.data.push(object);
    }

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i], type = types[i], parser = parsers[type];

      if (!parser) {
        for (var j = 0; j < $.data.length; j++) {
          $.data[j][key] = parsers["relation"]($.map[$.data[j].id][key], type, url, $.data[j].id);
        }
      }
    }

    return $.data;
  };

  return {
    version: "{version}",

    separators: {
      column: ";",
      array : ","
    },

    init : defineParsers,

    fetch: function(url) {

    	// modified output to use readFile and read local file
    	// return cache[url] ? cache[url].data : toObjects(ajax(url), url);
    	// return cache[url] ? cache[url].data : toObjects(readFile(url), url);
    	return toObjects(readFile(url), url);
    }
  };
}());

Array.indexOf || (Array.prototype.indexOf = function(v) {
  for (var i = this.length; i-- && this[i] != v;);
  return i;
});

String.trim || (String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, "");
});

String.prototype.toObjects = function() {
  return Csonv.fetch(this.toString());
};

String.prototype.csvSplit = function(s) {

  s = s || Csonv.separators.column;

  var reg_exp = new RegExp(("(\\" + s + '|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\\' + s + "\\r\\n]*))"), "gi");
  var str = this.trim(), row = [], m = null;

  if (str.match(new RegExp("^\\" + s))) {
    row.push("");
  }

  while (m = reg_exp.exec(str)) {
    var m1 = m[1];
    if (m1.length && (m1 != s)) {
      row.push(m1);
    }
    var value = m[2] ? m[2].replace(new RegExp('""', "g"), '"') : m[3];
    row.push(value);
  }

  return row;
};



Array.prototype.filter = function(fun /*, thisArg */) {

    "use strict";

    if (this === void 0 || this === null) {
        throw new TypeError();
    }


    var t = Object(this);
    var len = t.length >>> 0;

    if (typeof fun != "function") {
        throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;

    for (var i = 0; i < len; i++) {

      if (i in t) {

        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
            res.push(val);
        }
      }
    }

    return res;
};

Csonv.init();

}