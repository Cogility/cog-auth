
import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
// import Pretender from 'pretender';
//
// var application, server;

moduleFor('authorizer:cog-auth', {
  // Specify the other units that are required for this test.
  needs: ['service:cog-auth']
});

// Verify the module can be instanced
test('it exists', function(assert) {
  var auth = this.subject();
  assert.ok(auth);
});

// Verify the authorizer sets the token on the request
test('it sets the token in the header', function(assert) {
  var token = null;
  var wasCalled = false;
  var auth = this.subject();
  auth.set('flashes', Ember.Object.create({
    success: function(message, options={}) {
      console.log('@@@@ Request success: ',{message: message, options: options});
    },
    danger: function(message, options={}) {
      assert.ok(false, '#### Danger called on flashes object, '+message+' options: '+JSON.stringify(options));
    }
  }));
  var userService = auth.get('user');
  assert.ok(userService, "Failed to get user service instance");
  userService.set('token', "xyzzy");
  var func=function(name, val) {
    wasCalled = true;
    assert.equal(name,'Authorization', 'Authorizer did not set the Authorization header');
    token = val;
  };
  auth.authorize({token: 'sessionToken'}, func);
  assert.equal(wasCalled, true, "Request header was not set");
  assert.equal(token, "xyzzy", "Token was not set");
});
