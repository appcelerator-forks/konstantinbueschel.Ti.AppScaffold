/*
 * app.js
 *
 * /Resources/app.js
 *
 * Application bootstrap file
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

// require application controller
var appController = require('/control/ApplicationController');

appController.launch(require('/helpers/common/tools').isAndroid ? Ti.Android.currentActivity.intent.getData() : null);
