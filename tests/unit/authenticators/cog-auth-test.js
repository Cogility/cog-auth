
import { moduleFor, test } from 'ember-qunit';
import Ember from 'ember';
import Pretender from 'pretender';

var server;

moduleFor('authenticator:cog-auth', {
  // Specify the other units that are required for this test.
  needs: ['service:cog-auth'],

  beforeEach: function() {
    server = new Pretender();
    server.post('/security/login', function(request) {
      console.log('@@@@ In pretender server with body: ',request.requestBody);
      if (request.requestBody === 'username=cogadmin&password=P%40ssw0rd') {
        return [200, {'Content-Type': 'text/json'}, JSON.stringify({
          "resultCode": 0,
          "description": "Success",
          "token": "PQC0PaupaLN2/mIN4jZ2aZZ6dlDQFu7XPxWn0GsqAwJ03KMwrOHKM=",
          "modelName": "Modeler2",
          "user": {
            "createdAt": "2014-07-07T02:47:15.127Z",
            "lastLogin": 1427480931391,
            "firstname": "Cogility",
            "loginRetries": 0,
            "lastLoginFail": 1427480762281,
            "lastPasswordChange": "2014-07-07T02:47:15.127Z",
            "locked": false,
            "email": "administrator@cogility.com",
            "lastname": "Administrator",
            "username": "cogadmin",
            "id": "cogadmin",
            "_id": "53ba0a335ad285da13000002",
            "_type": "SecurityUser",
            "roles": [
              "admin"
            ],
            "className": "SecurityUser"
          }
        })];
      } else {
        return [401, {'Content-Type': 'text/json'},
          JSON.stringify({resultCode: '-1', message: 'Unauthorized'})];
      }
    }, false);
  },

  afterEach: function() {
    server.shutdown();
  }

});

// Verify the module loads
test('it exists', function(assert) {
  var auth = this.subject();
  assert.ok(auth);
});

// Verify it authenticates against the (mock) server and gets the token
test('it sets the token on login', function(assert) {
  var flashes = [];
  var auth = this.subject();
  auth.set('flashes', Ember.Object.create({
    success: function(message, options={}) {
      flashes.push( {message: message, options: options});
    },
    danger: function(message, options={}) {
      assert.ok(false, '#### Danger called on flashes object, '+message+' options: '+JSON.stringify(options));
    }
  }));
  var userService = auth.get('user');
  assert.ok(userService, "Failed to get user service instance");
  var promise = null;
  Ember.run(function() {
    promise = auth.authenticate('cogadmin', 'P@ssw0rd');
  });
  return promise.then(function() {
    assert.equal(userService.get('token'), "PQC0PaupaLN2/mIN4jZ2aZZ6dlDQFu7XPxWn0GsqAwJ03KMwrOHKM=", 'Failed to set token on authentication');
    assert.equal(flashes.length, 1, "Failed to get flash for authentication");
  });
});

// Verify it restores the session against the (mock) server and gets the token
test('it sets the token on restore', function(assert) {
  var flashes = [];
  var auth = this.subject();
  auth.set('flashes', Ember.Object.create({
    success: function(message, options={}) {
      flashes.push( {message: message, options: options});
    },
    danger: function(message, options={}) {
      assert.ok(false, '#### Danger called on flashes object, '+message+' options: '+JSON.stringify(options));
    }
  }));
  var userService = auth.get('user');
  var promise = null;
  Ember.run(function() {
    promise = auth.restore({identification:'cogadmin', password:'P@ssw0rd'});
  });
  return promise.then(function() {
    assert.equal(userService.get('token'), "PQC0PaupaLN2/mIN4jZ2aZZ6dlDQFu7XPxWn0GsqAwJ03KMwrOHKM=", 'Failed to set token on authentication');
    assert.equal(flashes.length, 0, "Generated a flash on restore");
  });
});


// Verify if it fails against the (mock) server it clears the token
test('it clears the token on failed login', function(assert) {
  var flashes = [];
  var auth = this.subject();
  auth.set('flashes', Ember.Object.create({
    danger: function(message, options={}) {
      flashes.push( {message: message, options: options});
    }
  }));
  var userService = auth.get('user');
  userService.set('token', 'test');
  var promise = null;
  Ember.run(function() {
    promise = auth.authenticate('test', 'test');  // The server stub does not care about the inputs currently
  });
  return new Ember.RSVP.Promise(function(resolve, reject) {
    promise.then(function() {
      assert.fail('Authenticate did not reject credentials');
      reject();
    }).catch(function() {
      assert.equal(userService.get('token'), null, 'Failed to clear token on failure to authenticate');
      assert.equal(flashes.length, 1, "Failed to get flash message for authentication failure");
      resolve();
    });
  });
});

// Verify if it fails to restore the session against the (mock) server it clears the token
test('it clears the token on failed restore', function(assert) {
  var flashes = [];
  var auth = this.subject();
  auth.set('flashes', Ember.Object.create({
    danger: function(message, options={}) {
      flashes.push( {message: message, options: options});
    }
  }));
  var userService = auth.get('user');
  userService.set('token', 'test');
  var promise = null;
  Ember.run(function() {
    promise = auth.restore({identification: 'test', password: 'test'});  // The server stub does not care about the inputs currently
  });
  return new Ember.RSVP.Promise(function(resolve, reject) {
    promise.then(function() {
      assert.ok(false, 'Authenticate did not reject credentials');
      reject();
    }).catch(function() {
      assert.equal(userService.get('token'), null, 'Failed to clear token on failure to restore');
      assert.equal(flashes.length, 1, "Failed to get flash message for restore failure");
      resolve();
    });
  });
});

// Verify the error code for a successful login is set in the auth service
test('it sets the status code to 200 on success', function(assert) {
  var flashes = [];
  var auth = this.subject();
  auth.set('flashes', Ember.Object.create({
    success: function(message, options={}) {
      flashes.push( {message: message, options: options});
    },
    danger: function(message, options={}) {
      assert.ok(false, '#### Danger called on flashes object, '+message+' options: '+JSON.stringify(options));
    }
  }));
  var userService = auth.get('user');
  assert.ok(userService, "Failed to get user service instance");
  var promise = null;
  Ember.run(function() {
    promise = auth.authenticate('cogadmin', 'P@ssw0rd');
  });
  return promise.then(function() {
    assert.equal(userService.get('lastStatus'), 200, 'Failed to set status on authentication');
    assert.equal(flashes.length, 1, "Failed to get flash for authentication");
  });
});

// Verify the error code for a login is set in the auth service
test('it sets the status code to 401 on rejection', function(assert) {
  var flashes = [];
  var auth = this.subject();
  auth.set('flashes', Ember.Object.create({
    success: function(message, options={}) {
      assert.ok(false, '#### Success called on flashes object, '+message+' options: '+JSON.stringify(options));
    },
    danger: function(message, options={}) {
      flashes.push( {message: message, options: options});
    }
  }));
  var userService = auth.get('user');
  assert.ok(userService, "Failed to get user service instance");
  var promise = null;
  Ember.run(function() {
    promise = auth.authenticate('cogadmin', 'P@w0rd');
  });
  return new Ember.RSVP.Promise(function(resolve, reject) {
    promise.then(function() {
      assert.ok(false,'Authentication did not fail on bad credentials');
      reject('failed to reject authentication');
    }).catch(function() {
      assert.equal(userService.get('lastStatus'), 401, 'Failed to set status on authentication');
      assert.equal(JSON.parse(userService.get('lastResponse')).message, 'Unauthorized');
      assert.equal(flashes.length, 1, "Failed to get flash for authentication");
      resolve();
    });
  });
});
