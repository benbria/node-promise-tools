"use strict"

let chai = require('chai');
chai.use(require('chai-as-promised'));
let expect = chai.expect;
let promiseTools = require('../src');

describe('TimeoutError', () => {
    it('should have correct type', () => {
        let err = new promiseTools.TimeoutError("timeout");
        expect(err instanceof promiseTools.TimeoutError).to.be.true;
        expect(err instanceof Error).to.be.true;
    });
});
