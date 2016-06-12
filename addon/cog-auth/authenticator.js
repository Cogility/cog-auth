// addon/cog-auth/authenticators

import Base from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';

/* global jQuery */
/* jshint unused:vars */

/**
 * An authenticator for ember-simple-auth
 */
export default Base.extend({
  user: Ember.inject.service('cog-auth'),
  flashes: Ember.inject.service('flash-messages'),

  /**
   * Restore the session from the provided stored session data.
   * @param {object} data - The data stored for the session
   */
  restore: function(data) {
    var userService = this.get("user");
    var flashService = this.get('flashes');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        console.log('@@@@ Restoring from saved data: ',data);
        Ember.run(function() {
          if (!data.token) {
            userService.set('lastStatus', 200);
            userService.set('lastResponse', null);
            flashService.danger('Restore Session Failed');
            userService.set('token', null);
            userService.set('userName', null);
            reject();
          } else {
            console.log('@@@@ Restore UserName: '+data.identification+' token: '+data.token);
            userService.set('lastStatus', null);
            userService.set('lastResponse', null);
            userService.set('userName', data.identification);
            userService.set('token', data.token);
            userService.set('userDetails', data.user);
            userService.set('modelName', data.modelName);
            resolve({identification: data.identification,
              token: data.token,
              user: data.user,
              modelName: data.modelName});
          }
        });
        resolve(data);
      } catch (err) {
        console.log('#### Error in authenticator: '+err, err.stackTrace);
        flashService.danger('Login Restore Failed');
        userService.set('token', null);
        userService.set('userName', null);
        reject(err);
      }
    });
  },

  /**
   * Authenticate the session from the provided credentials.  Data returned
   * is stored for session restoration and reference.
   * @param {string} identification - The username
   * @param {string} password       - The password
   * @param {object} The data for the session
   */
  authenticate: function(identification, password) {
    var userService = this.get("user");
    var flashService = this.get('flashes');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        var loginPath = '/security/login';
        let authData = {username: identification, password: password};
        jQuery.ajax(loginPath, {
          type: 'POST',
          data: authData,
          success: function (data, textStatus, jqXHR) {
            Ember.run(function() {
            userService.set('lastStatus', jqXHR.status);
            userService.set('lastResponse', jqXHR.responseBody);
              console.log('@@@@ Login Authentication with: ',identification,',',password,' Current user: ' + userService.get('userName') + ' status: ' + textStatus + ' token: ' + data.token);
              if (!data.token) {
                //console.log('####   Login Response data: ' + JSON.stringify(data));
                flashService.danger('Login Failed');
                userService.set('token', null);
                userService.set('userName', null);
                reject();
              } else {
                Ember.run(function () {
                  console.log('@@@@ Login UserName: '+identification+' token: '+data.token);
                  userService.set('userName', identification);
                  flashService.success('Login Successful', {timeout: 5000});
                  userService.set('token', data.token);
                  userService.set('userDetails', data.user);
                  userService.set('modelName', data.modelName);
                  resolve({identification: identification,
                    token: data.token,
                    modelName: data.modelName,
                    user: data.user
                  });
                });
              }
            });
          },
          error: function (jqXHR, textStatus, error) {
            /*jshint unused:vars */
            Ember.run(function() {
              if (jqXHR.status !== 401 && jqXHR.status !== 403) {
                console.log('#### Error in authentication: ' + textStatus + ' ' + error);
              }
              userService.set('lastStatus', jqXHR.status);
              userService.set('lastResponse', jqXHR.responseText);
              console.log('#### Response on error: ',jqXHR.responseText);
              flashService.danger('Login Failed');
              userService.set('token', null);
              userService.set('userName', null);
              reject(error);
            });
          },
          dataType: 'json'
        });
      } catch (err) {
        console.log('#### Error in authenticator: '+err, err.stackTrace);
        flashService.danger('Login Failed');
        userService.set('token', null);
        userService.set('userName', null);
        reject(err);
      }
    });
  }
  //invalidate: function(data) {
  //  …
  //}
});
