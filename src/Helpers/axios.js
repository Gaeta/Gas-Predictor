/*
 * Copyright (C) Donald Gaeta <dj@gaeta.me>, April 2022-Current - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Elmer Fudd <efudd@yoyodyne.com>, September 1943
*/

const Axios = require('axios');

/** 
 * The HTTP module is used to make HTTP requests to the Cloudprint API. 
 * 
 * @returns Axios.instance
 * @private
 */
module.exports = (baseUrl) => Axios.create({
  baseURL: baseUrl,
  timeout: 5000,
});