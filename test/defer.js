"use strict"

let chai = require('chai');
chai.use(require('chai-as-promised'));
let expect = chai.expect;
let promiseTools = require('../src');

describe('defer', () => {
    it('should resolve', () => {
        let deferred = promiseTools.defer();
        deferred.resolve("done");
        return expect(deferred.promise).to.eventually.equal("done");
    });

    it('should reject', () => {
        let deferred = promiseTools.defer();
        deferred.reject(new Error("boom"));
        return expect(deferred.promise).to.eventually.be.rejectedWith("boom");
    });
});
