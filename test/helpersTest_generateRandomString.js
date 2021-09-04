const chai = require('chai');
const assert = chai.assert;

const { generateRandomString } = require('../helpers');

describe('#generateRandomString', () => {
  it('should return 6-digit string', () => {
    const length = generateRandomString(6).length;
    const expectedOutput = 6;
    assert.strictEqual(length, expectedOutput);
  });
  it('should return 8-digit string', () => {
    const length = generateRandomString(8).length;
    const expectedOutput = 8;
    assert.strictEqual(length, expectedOutput);
  });
});