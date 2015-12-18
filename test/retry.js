"use strict"

let chai = require('chai');
chai.use(require('chai-as-promised'));
let expect = chai.expect;
let promiseTools = require('../src');

let callCount = 0;
let getTest = (times) => {
    return () => {
        callCount++;
        if (callCount === times) return callCount;
        else throw new Error('not done yet');
    }
}

describe('retry', () => {
    beforeEach(() => {
        callCount = 0;
    });

    it('should retry infinitely and resolve', () => {
        let retry = promiseTools.retry(-1, getTest(3));
        return expect(retry).to.eventually.equal(3);
    });

    it('should reject', (done) => {
        let retry = promiseTools.retry(3, getTest(4));
        retry.catch((attempts) => {
            try {
                expect(attempts.length).to.eq(3);
                done();
            } catch (err) {
                done(err);
            }
        })
    });

    [
        {options: {times: 5, interval: 10}, msg: 'times and interval'},
        {options: {times: 5}, msg: 'just times'},
        {options: {}, msg: 'neither times nor interval'}
    ].forEach((args) => {
        it(`should accept first argument as an options hash with ${args.msg}`, () => {
            let retry = promiseTools.retry(args.options, getTest(5));
            return expect(retry).to.eventually.equal(5);
        });
    });

    it('should return an error with invalid options argument', () => {
        let p = Promise.resolve().then(() => {
            // had to do this for some reason. Otherwise `chai-as-promised` always passed erroneously.
            try {
                return promiseTools.retry(undefined, getTest(1));
            } catch (err) {
                throw err;
            }
        });
        expect(p).to.eventually.be.rejectedWith('Unsupported argument type for \'times\': undefined');
    });

    it('should reject when an Error value is resolved', () => {
        let retry = promiseTools.retry(1, () => {
            return new Error('boom');
        });
        return expect(retry).to.eventually.be.rejectedWith('boom');
    });

});
