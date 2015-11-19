"use strict"

let chai = require('chai');
chai.use(require('chai-as-promised'));
let expect = chai.expect;
let promiseTools = require('../src');

describe('delay', () => {
    it('should wait the specified delay and then resolve', () => {
        return expect(promiseTools.delay(10)).to.be.fulfilled;
    });
});
