// addon/cog-auth/authenticators

import Base from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';

/* global jQuery */
/* jshint unused:vars */

export default Base.extend({
  user: Ember.inject.service('cog-auth'),
  flashes: Ember.inject.service('flash-messages'),

  restore: function(data) {
    var userService = this.get("user");
    var flashService = this.get('flashes');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      try {
        var options = data;
        var loginPath = '/security/login';
        let authData = {username: options.identification, password: options.password};
        jQuery.ajax(loginPath, {
          type: 'POST',
          data: authData,
          success: function (data, textStatus, jqXHR) {
            Ember.run(function() {
              userService.set('lastStatus', jqXHR.status);
              userService.set('lastResponse', jqXHR.responseBody);
              console.log('@@@@ Restore Authentication with: ' + JSON.stringify(options) + ' Current user: ' + userService.get('userName') + ' status: ' + textStatus + ' token: ' + data.token);
              if (!data.token) {
                flashService.danger('Restore Session Failed');
                userService.set('token', null);
                userService.set('userName', null);
                //console.log('####   Restore Response data: ' + JSON.stringify(data));
                reject();
              } else {
                console.log('@@@@ Restore UserName: '+options.identification+' token: '+data.token);
                userService.set('userName', options.identification);
                userService.set('token', data.token);
                userService.set('userDetails', data.user);
                userService.set('modelName', data.modelName);
                resolve({identification: options.identification, password: options.password});
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
              userService.set('lastResponse', jqXHR.responseBody);
              flashService.danger('Restore Session Failed');
              userService.set('token', null);
              userService.set('userName', null);
              reject(error);
            });
          },
          dataType: 'json'
        });
      } catch (err) {
        console.log('#### Error in authenticator: '+err, err.stackTrace);
        flashService.danger('Login Restore Failed');
        userService.set('token', null);
        userService.set('userName', null);
        reject(err);
      }
    });
  },

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
                  resolve({identification: identification, password: password});
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
