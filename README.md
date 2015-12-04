[![Build Status](https://travis-ci.org/benbria/node-promise-tools.svg?branch=master)](https://travis-ci.org/benbria/node-promise-tools)
[![Coverage Status](https://coveralls.io/repos/benbria/node-promise-tools/badge.svg?branch=master&service=github)](https://coveralls.io/github/benbria/node-promise-tools?branch=master)

## What is it?

There are a lot of nice Promise libraries out there like [bluebird](https://github.com/petkaantonov/bluebird) and
[q](https://github.com/kriskowal/q), with many handy functions that go above and beyond the small set of standard
functions defined in the ECMAScript 2015 standard. But all of these libraries make you use their implementation of
Promise (because all of them have been around since before Promises were part of the ECMAScript standard), and
most of them are kind of on the big side (bluebird clocks in at almost 166k, unminified.)

The goal of `promise-tools` is to provide a small library of [async](https://github.com/caolan/async)-like functions,
and some other handy functions, and let you use these functions on top of any Promise implementation.

(Also, if you're writing a library and you want to make it easy for your callers to use either Promises or callbacks,
be sure to check out [promise-breaker](https://github.com/jwalton/node-promise-breaker)).

## Installation

    npm install --save promise-tools

## Requirements

This library assumes that `Promise` is a defined global variable.  If this is not the case
on your platform, you can use a polyfill:

    npm install --save es6-promise

Then somewhere in your node.js application:

    require('es6-promise');

# API

## Utilities

* [`defer`](#defer)
* [`delay`](#delay)

## Control Flow
* [`parallel`](#parallel), `parallelLimit`
* [`series`](#series)
* [`timeout`](#timeout)
* [`whilst`](#whilst), `doWhilst`


# Utilities

<a name="defer"/>
### defer()

Returns a `{promise, resolve, reject}` object.  The returned `promise` will resolve or reject when `resolve` or
`reject` are called.

Example:

    var deferred = promiseTools.defer();
    deferred.then(function(result) {console.log(result);});
    deferred.resolve("Hello world!");


<a name="delay"/>
### delay(ms)

Returns a Promise which resolves after `ms` milliseconds have elapsed.  The returned Promise will never reject.

Example:

    console.log("start!");
    promiseTools.delay(100)
    .then(function() {console.log("end!");});




# Control Flow

<a name="parallel"/>
### parallel(tasks, limit)

Alias: `parallelLimit`

Given an array of `tasks`, where each task is a function which takes no arguments and returns a Promise, executes each
task in parallel (which is to say that all tasks will be started at once).  If `limit` is supplied, then at most `limit`
tasks will be started, and then as soon as any of these tasks complete a new task will be started to replace it.

Resolves to an array of equal length to `tasks` containing results returned by each task.  If any task rejects,
then this will reject immediately.

Example:

    promiseTools.parallel([
        function() {return Promise.resolve("a");},
        function() {return "b";} // Note that raw return values are OK.
    ]).then(function(results) {
        // `results` will be ["a", "b"]
    });

    // Start 3 tasks, and then whenever a task completes will
    // run another task, until all tasks are complete.
    promiseTools.parallel(tasks, 3);


<a name="series"/>
### series(tasks)

Given an array of `tasks`, where each task is a function which takes no arguments and returns a Promise, executes each
task one after another in series.  A given task will not be started until the preceding task completes.

Resolves to an array of equal length to `tasks` containing results returned by each task.  If any task rejects,
then this will reject immediately.

Example:

    promiseTools.series(
        function() {return Promise.resolve("a");}
        function() {return "b";} // Note that raw return values are OK.
    ).then(function(results) {
        // `results` will be ["a", "b"]
    });


<a name="timeout"/>
### timeout(promise, ms)

Adds a timeout to an existing Promise.

Resolves to the same value as `promise` if `promise` resolves within `ms` milliseconds, otherwise the returned
Promise will reject with the error "Timeout: Promise did not resolve within ${ms} milliseconds".  The generated error
will be an instance of `promiseTools.TimeoutError`.

Note that the underlying `promise` will continue to run, as there is no way to "cancel" a Promise in JavaScript.

Example:

    // Will reject if `doSomething` takes longer than 500 milliseconds.
    promiseTools.timeout(doSomething(), 500)
    .then(...)

<a name="whilst"/>
### whilst(fn, test), doWhilst(test, fn)

While the synchronous function `test()` returns true, `whilst` will continuously execute `fn()`.  `fn()` should return
a Promise.  `whilst` will resolve to the same value as the final call to `fn()`.  If `fn()` or `test()` throw an error,
then `whilst()` will reject immediately.

`doWhilst()` is similar to `whilst()`, but `whilst()` might execute `fn()` zero times if `test()` returns false on the
first run, where `doWhilst()` is guaranteed to call `fn()` at least once.  Note that the parameters are reversed
between `whilst()` and `doWhilst()`.

Example:

    var count = 0;
    promiseTools.whilst(
        function() {
            count++;
            return Promise.resolve(count);
        },
        function() {return count > 10;}
    )
    .then(function(result) {
       // result will be 10 here.
    });
