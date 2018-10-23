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
        let retry = promiseTools.retry(Infinity, getTest(3));
        return expect(retry).to.eventually.equal(3);
    });

    it('should reject', (done) => {
        let retry = promiseTools.retry(3, getTest(4));
        retry.catch((lastAttempt) => {
            try {
                expect(lastAttempt).to.be.instanceof(Error);
                done();
            } catch (err) {
                done(err);
            }
        })
    });

    [
        {options: {times: 5, interval: 10}, msg: 'times and interval'},
        {options: {times: 5}, msg: 'just times'},
        {options: {times: 5.4}, msg: 'just times'},
        {options: {times: Infinity}, msg: 'times = Infinity'},
        {options: {}, msg: 'neither times nor interval'},
    ].forEach((args) => {
        it(`should accept first argument as an options hash with ${args.msg}`, () => {
            let retry = promiseTools.retry(args.options, getTest(5));
            return expect(retry).to.eventually.equal(5);
        });
    });

    it('should error if interval is infinity', () => {
        return expect(
            promiseTools.retry({times: 5, interval: Infinity}, getTest(1))
        ).to.eventually.be.rejectedWith(`'interval' may not be Infinity`);
    })


    it('should call the default 5 times with no options provided', () => {
        let retry = promiseTools.retry(getTest(5));
        return expect(retry).to.eventually.equal(5);
    })

    it('should throw when given a bogus `times` option', () => {
        let retry = promiseTools.retry('5', getTest(5));
        return expect(retry).to.be.eventually.rejected;
    })

    it('should return an error with invalid options argument', () => {
        return expect(
            promiseTools.retry({times: "foo"}, getTest(1))
        ).to.eventually.be.rejectedWith('Unsupported argument type for \'times\': string');
    });

    it('should reject when called with nothing', () => {
        expect(promiseTools.retry()).to.eventually.be.rejectedWith('No parameters given');
    })
});
