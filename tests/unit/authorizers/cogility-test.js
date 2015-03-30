
import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import Pretender from 'pretender';

var application, server;

moduleFor('authorizer:cogility', {
  // Specify the other units that are required for this test.
  needs: ['service:cogility']
});

// Verify the module can be instanced
test('it exists', function(assert) {
  var auth = this.subject();
  assert.ok(auth);
});

// Verify the authorizer sets the token on the request
test('it sets the token', function(assert) {
  var token = null;
  var wasCalled = false;
  var auth = this.subject();
  var userService = auth.get('user');
  assert.ok(userService, "Failed to get user service instance");
  userService.set('token', "xyzzy");
  var jqXHR = {};
  jqXHR.setRequestHeader=function(name, val) {
    wasCalled = true;
    if (name === 'Authorization') {
      token = val;
    }
  };
  auth.authorize(jqXHR, {});
  assert.equal(wasCalled, true, "Request header was not set");
  assert.equal(token, "xyzzy", "Token was not set");
});
