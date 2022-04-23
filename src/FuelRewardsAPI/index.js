/*
 * Copyright (C) Donald Gaeta <dj@gaeta.me>, Apirl 2022-Current - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Elmer Fudd <efudd@yoyodyne.com>, September 1943
*/

// Import the required modules
const Util = new require('../util');
const Http = require('../Helpers/axios');
const EventEmmiter = require('events');

/** 
 * The FuelRewardsAPI class is the main entry point for the Fuel Rewards API.
 */
class FuelRewardsAPI extends EventEmmiter {
  /** 
   * The FuelRewardsAPI constructor.
   * 
   * @param {Object} options The options object.
   * @param {String} options.authId The user id. (found within the http header of the APP)
   * @param {String} options.authPassword The password. (found within the http header of the APP)
   * @param {Boolean=} [options.debug=false] Whether or not to enable debug mode.
   * @param {String=} [options.baseUrl=https://member-connect.excentus.com/fuelrewards/public/rest/v2/frnExcentus/] The base URL.
   * 
   * @param {Object=} options.frMember The Fuel Rewards member object.
   * @param {String=} options.frMember.userId The member id. You can set your own or we will get you one. (We will almost never use this)
   * @param {String=} options.frMember.password The member password. 
   * 
   * 
   * @example
   * const fr = new FuelRewardsAPI({
   *  authId: '6694b1c8-9880-4e6f-8203-e2a83222ea5c',
   *  authPassword: '5866a82f-fb1b-460b-a2f8-2960f187baab',
   *  frMember: {
   *   userId: 'fakeemail@github.com',
   *   password: 'SomeRealPassword'
   * }
   */
  constructor(options = {}) {
    super();
    this.options = Util.mergeDefault({
        authId: null,
        authPassword: null,
        debug: false,
        baseUrl: "https://member-connect.excentus.com/fuelrewards/public/rest/v2/frnExcentus/",
        frToken: {
          token: null,
          expires: null 
        },
        frMember: {
          userId: null,
          password: null,
          accountNumber: null,
          token: null,
          token_expires: null,
        }
    }, options);

    this.http = Http(this.options.baseUrl);

    /** 
     * @description If the library is ready to be used.
     * 
     * @type {Boolean}
     * @default false
     */
    this.ready = false;


    if (((!this.options.authId || !this.options.authPassword) && !this.options.frToken.token) || ((!this.options.frMember.userId || !this.options.frMember.password) && !this.options.frMember.token)) throw new Error('You must provide either a authId & authPassword or a token and frMember userId & password or token');

    if (((this.options.authId && this.options.authPassword) || this.options.frToken.token) && ((this.options.frMember.userId && this.options.frMember.password) || this.options.frMember.token)) this.initCreds({
      authId: this.options.authId,
      authPassword: this.options.authPassword,
      frToken: this.options.frToken.token,
      frMember: {
        userId: this.options.frMember.userId,
        password: this.options.frMember.password,
      },
      frMemberToken: this.options.frMember.token,
    });
    else throw new Error('You must provide either a authId & authPassword or a token and frMember userId & password or token');
  }

  /**
  * @description Debug related events
  * 
  * @event FuelRewardsAPI#debug
  * @param {String} info The debug info
  * @memberof FuelRewardsAPI
  * 
  * @example
  * FuelRewardsAPI.on("debug",  console.log);
  */

 /**
  * @description When the process has an error event.
  * 
  * @event FuelRewardsAPI#error
  * @param {Error} error The error object
  * @memberof FuelRewardsAPI
  * 
  * @example
  * FuelRewardsAPI.on("error",  console.log);
  */

  /** 
   * @description Initializes the credentials.
   * 
   * @param {Object} options The options object.
   * @param {String} options.authId The user id. (found within the http header of the APP)
   * @param {String} options.authPassword The password. (found within the http header of the APP)
   * @param {String=} [options.frToken] The token that can be used instead of authId & authPassword. (not recommended)
   * 
   * @param {Object=} options.frMember The Fuel Rewards member object.
   * @param {String=} options.frMember.userId The member email/id.
   * @param {String=} options.frMember.password The member password.
   * 
   * @param {String=} options.frMemberToken The member token that can be used instead of userId & password. (not recommended)
   * 
   * @memberof FuelRewardsAPI
  */

  initCreds(settings = {}) {
     settings = Util.mergeDefault({
        authId: null,
        authPassword: null,
        frToken: null,
        frMember: {
          userId: null,
          password: null,
        },
        frMemberToken: null,
      }, settings);

      if ((settings.authId && settings.authPassword) && (settings.frMember.userId && settings.frMember.password)) {
        if (this.options.debug) this.emit('debug', "initCreds: authId & authPassword");
        this.http.post('https://auth-connect.excentus.com/authservice/v2/accesstokens', require('querystring').stringify({
          bizType: 'B2C',
          grant_type: 'client_credentials',
        }), {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(settings.authId + ':' + settings.authPassword).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        }).then(responce => {
          if (responce.data.responseCode !== 'SUCCESS') throw new Error(responce.data.displayErrorMessage);
          if (this.options.debug) this.emit('debug', "initCreds: authId & authPassword global creds SUCCESS: " + JSON.stringify(responce.data));

          this.options.frToken = {
            token: responce.data.accessToken,
            expires: responce.data.expiresIn - 5, // 5 seconds buffer
          }

          // Login into Member

          this.http.post('/login', {
            userId: settings.frMember.userId,
            password: settings.frMember.password,
          }, {
            headers: {
              "access_token": this.options.frToken.token,
              "Content-Type": "application/json"
            }
          }).then(responce => {
            if (responce.data.responseCode !== 'SUCCESS') throw new Error(responce.data.displayErrorMessage);
            if (this.options.debug) this.emit('debug', "initCreds: userId & password member creds SUCCESS: " + JSON.stringify(responce.data));
            
            this.options.frMember = { // This should almost never be used only thing be takend from this is the accountNumber
              accountNumber: responce.data.accountNumber,
              token: responce.data.token.memberAccessToken,
              expires: responce.data.token.ttl - 5, // 5 seconds buffer
            }

            return Promise.all([]).then(() => {this.ready = true; this.emit('ready', this);});
          })
          .catch(error => {
            if (this.options.debug) this.emit('debug', "Login failed: " + error.message);
            this.emit('error', error);
            this.ready = false;
            throw error;
          })

        }).catch(error => {
          if (this.options.debug) this.emit('debug', "Login failed: " + error.message);
          this.emit('error', error);
          this.ready = false;
          throw error;
        })
      }
      else if (settings.frToken && settings.frMemberToken) {
        if (this.options.debug) this.emit('debug', "initCreds: frToken & frMemberToken");
      }
      else throw new Error('You must provide either a authId & authPassword or a token and frMember userId & password or token');
  }


  /** 
   * @description Gets all the stations in a longitude/latitude area.
   * 
   * @param {Object} options The options object.
   * @param {String=} [options.pageNumber=1] The page number.
   * @param {String=} [options.pageSize=1000] The page size.
   * @param {String=} [options.categoryIds=Fuel] How to sort the results.
   * @param {String} options.longitude The longitude of the current location.
   * @param {String} options.latitude The latitude of the current location.
   * @param {String} options.minLongitude The minimum longitude of the area.
   * @param {String} options.minLatitude The minimum latitude of the area.
   * @param {String} options.maxLongitude The maximum longitude of the area.
   * @param {String} options.maxLatitude The maximum latitude of the area.
   * 
   * 
   * @memberof FuelRewardsAPI
   */

  getStations(settings = {}) {
    settings = Util.mergeDefault({
      pageNumber: 1,
      rewardsInProgress: 'y',
      pageSize: 1000,
      maxLongitude: null,
      longitude: null,
      maxLatitude: null,
      minLongitude: null,
      latitude: null,
      minLatitude: null,
      categoryIds: "Fuel",
    }, settings);

    if (!this.ready) throw new Error('Fuel Rewards API is not ready');

    // Return the call of /locations with all the parameters
    return this.http.get('/locations',
    {
      params: {
        accountNumber: this.options.frMember.accountNumber,
        ...settings,
      },
      headers: {
        "access_token": this.options.frToken.token,
      }
    }).then(responce => {
      if (responce.data.responseCode !== 'SUCCESS') throw new Error(responce.data.displayErrorMessage);
      if (this.options.debug) this.emit('debug', "getStations: SUCCESS: " + JSON.stringify(responce.data));

      return responce.data.locations || [];
    }).catch(error => {
      if (this.options.debug) this.emit('debug', "getStations: FAILED: " + error.message);
      this.emit('error', error);
      throw error;
    });
  }

}

module.exports = FuelRewardsAPI;
