const chai = require('chai');
const assert = chai.assert;

const { findUserByEmail } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('#findUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail('user@example.com', testUsers);
    const expectedOutput = testUsers.userRandomID;
    assert.deepEqual(user, expectedOutput);
  });
  it('should return "undefined" with unknown email', () => {
    const user = findUserByEmail('user1@example.com', testUsers);
    assert.isUndefined(user);
  });
});