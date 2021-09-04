const chai = require('chai');
const assert = chai.assert;

const { urlsForUser } = require('../helpers');

const TestUrlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", user_id: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", user_id: "aJ48lW" }
};


describe('#urlsForUser', () => {
  it('should return URLs with valid user_id', () => {
    const url = urlsForUser('aJ48lW', TestUrlDatabase);
    const expectedOutput = { b6UTxQ: "https://www.tsn.ca", i3BoGr: "https://www.google.ca" };
    assert.deepEqual(url, expectedOutput);
  });
  it('should return {} with unknown user_id', () => {
    const url = urlsForUser('aJ48lA', TestUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(url, expectedOutput);
  });
});