/*
 * EventDispatcher.js
 *
 * /Resources/helpers/app/EventDispatcher.js
 *
 * This module represents an javascript event dispatcher on top of Backbone.Events
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

module.exports = require('/helpers/common/tools').clone(require('/helpers/common/backbone').Events);