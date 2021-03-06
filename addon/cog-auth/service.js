// addon/cot-auth/service
//
// A service for interacting with the current user, changing password, current roles, etc.

import Ember from 'ember';

export default Ember.Service.extend({
  userName: null,
  userDetails: null,
  modelName: null,
  token: null,
  lastStatus: null,
  lastReponse: null
});
