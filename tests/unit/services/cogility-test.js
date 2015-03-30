import {
  moduleFor,
  test
  } from 'ember-qunit';

moduleFor('service:cogility', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var service = this.subject();
  assert.ok(service);
  assert.equal(service.get('userName'), null, 'Service userName not initialized to null');
  assert.equal(service.get('token'), null, 'Service token not initialized to null');
});
