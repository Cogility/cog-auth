// addon/cog-auth/authorizer

import Base from 'ember-simple-auth/authorizers/base';
import Ember from 'ember';

export default Base.extend({
  user: Ember.inject.service('cog-auth'),
  authorize: function(jqXHR, requestOptions) {
    /*jshint unused:vars */
    var userService = this.get('user');
    var token = userService.get('token');
    //console.log('@@@@ Authorizing server request with token '+userService.get('token')+' url: '+requestOptions.url);
    jqXHR.setRequestHeader('Authorization', token);
  }
});
