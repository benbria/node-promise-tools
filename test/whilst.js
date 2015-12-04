"use strict"

let chai = require('chai');
chai.use(require('chai-as-promised'));
let expect = chai.expect;
let promiseTools = require('../src');

describe('whilst', () => {

    it('should execute a function over and over until the test returns true', () => {
        let count = 0;
        return expect(
            promiseTools.whilst(
                () => count < 10,
                () => {
                    count++;
                    return Promise.resolve(count);
                }
            )
        ).to.eventually.equal(10)
        .then( () => expect(count).to.equal(10) );
    });

    it('should work, even if fn does not return a promise', () => {
        let count = 0;
        return expect(
            promiseTools.whilst(
                () => count < 10,
                () => {
                    count++;
                    return count;
                }
            )
        ).to.eventually.equal(10)
    });

    it('should return `null` if `test` returns false immediately', () => {
        let fnCalled = false;
        return expect(
            promiseTools.whilst(
                () => false,
                () => {fnCalled = true;}
            )
        ).to.eventually.equal(null)
        .then(() => expect(fnCalled).to.be.false)
    });

    it('should reject if fn rejects', () => {
        let count = 0;
        return expect(
            promiseTools.whilst(
                () => count < 10,
                () => Promise.reject(new Error('foo'))
            )
        ).to.be.rejectedWith('foo');
    });

    it('should reject if fn throws', () => {
        let count = 0;
        return expect(
            promiseTools.whilst(
                () => count < 10,
                () => {
                    throw new Error('foo');
                }
            )
        ).to.be.rejectedWith('foo');
    });

    it('should reject if test throws', () => {
        return expect(
            promiseTools.whilst(
                () => {throw new Error('foo');},
                () => {}
            )
        ).to.be.rejectedWith('foo');
    });

});

describe('doWhilst', () => {

    it('should execute a function over and over until the test returns true', () => {
        let count = 0;
        return expect(
            promiseTools.doWhilst(
                () => {
                    count++;
                    return Promise.resolve(count);
                },
                () => count < 10
            )
        ).to.eventually.equal(10)
        .then( () => expect(count).to.equal(10) );
    });

    it('should call fn once, even if test returns false immediately', () => {
        let fnCount = 0;
        return expect(
            promiseTools.doWhilst(
                () => {
                    fnCount++;
                    return "hello";
                },
                () => false
            )
        ).to.eventually.equal("hello")
        .then( () => expect(fnCount).to.equal(1) );
    });

});
