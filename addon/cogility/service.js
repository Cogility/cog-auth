// addon/cogility/service
//
// A service for interacting with the current user, changing password, current roles, etc.

import Ember from 'ember';

export default Ember.Service.extend({
  userName: null,
  token: null
});
