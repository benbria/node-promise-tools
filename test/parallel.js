"use strict"

let chai = require('chai');
chai.use(require('chai-as-promised'));
let expect = chai.expect;
let promiseTools = require('../src');

describe('parallel', () => {
    it('should execute multiple functions and return results', () => {
        let tasks = [
            () => Promise.resolve("a"),
            () => "b",
            () => Promise.resolve("c")
        ];

        return Promise.all(tasks.map((task) => task()))
        .then((expectedResults) => {
            return expect(promiseTools.parallel(tasks)).to.eventually.eql(expectedResults);
        });
    });

    it('should stop if a function returns an error', () => {
        let tasks = [
            () => "a",
            () => {throw new Error("boom")},
            () => "c"
        ];

        return expect(promiseTools.parallel(tasks))
        .to.eventually.be.rejectedWith("boom")
    });

    it('should execute multiple functions and return results with a limit supplied', () => {
        let tasks = [
            () => promiseTools.delay(10).then(() => "a"),
            () => "b",
            () => promiseTools.delay(10).then(() => "c")
        ];

        return Promise.all([
            expect(promiseTools.parallelLimit(tasks, 1), "With 1 parallel").to.eventually.eql(['a', 'b', 'c']),
            expect(promiseTools.parallelLimit(tasks, 2), "With 2 parallel").to.eventually.eql(['a', 'b', 'c']),
            expect(promiseTools.parallelLimit(tasks, 3), "With 3 parallel").to.eventually.eql(['a', 'b', 'c']),
            expect(promiseTools.parallelLimit(tasks, 4), "With 4 parallel").to.eventually.eql(['a', 'b', 'c'])
        ])
    });

    it('should execute tasks concurrently to a limit', () => {
        let running = 0;
        let maxRunning = 0;
        let task = () => {
            running++;
            maxRunning = Math.max(maxRunning, running);

            return promiseTools.delay(5)
            .then(() => {
                running--;
            });
        }
        let tasks = []
        for(let i = 0; i < 10; i++) {
            tasks.push(task);
        }

        return promiseTools.parallelLimit(tasks, 3)
        .then(() => {
            expect(maxRunning).to.equal(3);
        });
    });

    it('should stop if a function returns an error when a limit is supplied', () => {
        let tasks = [
            () => "a",
            () => {throw new Error("boom")},
            () => "b"
        ];

        return Promise.all([
            expect(promiseTools.parallelLimit(tasks, 1), "With 1 parallel").to.eventually.rejectedWith("boom"),
            expect(promiseTools.parallelLimit(tasks, 2), "With 2 parallel").to.eventually.rejectedWith("boom"),
            expect(promiseTools.parallelLimit(tasks, 3), "With 3 parallel").to.eventually.rejectedWith("boom"),
            expect(promiseTools.parallelLimit(tasks, 4), "With 4 parallel").to.eventually.rejectedWith("boom"),
        ])
    });
});
