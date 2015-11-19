"use strict"

let chai = require('chai');
chai.use(require('chai-as-promised'));
let expect = chai.expect;
let promiseTools = require('../src');

describe('series', () => {
    it('should execute multiple functions and return results', () => {
        let tasks = [
            () => Promise.resolve("a"),
            () => "b",
            () => Promise.resolve("c")
        ];

        return Promise.all(tasks.map((task) => task()))
        .then((expectedResults) => {
            return expect(promiseTools.series(tasks)).to.eventually.eql(expectedResults);
        });
    });

    it('should execute multiple functions one by one', () => {
        let order = "";
        let tasks = [
            () =>
                promiseTools.delay(10)
                .then(() => {order = order + "a";})
            ,
            () => order = order + "b"
        ];

        return promiseTools.series(tasks)
        .then(() => {
            expect(order).to.equal("ab");
        });
    });

    it('should stop if a function returns an error', () => {
        let order = "";
        let tasks = [
            () => promiseTools.delay(10).then(() => order = order + "a"),
            () => {throw new Error("boom")},
            () => order = order + "b"
        ];

        return expect(promiseTools.series(tasks))
        .to.eventually.be.rejectedWith("boom")
        .then(() => {
            // Should execute the first function, but not the third function.
            expect(order).to.equal("a");
        });
    });
});
