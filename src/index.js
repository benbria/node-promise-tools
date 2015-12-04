"use strict"

let hasProp = {}.hasOwnProperty;
let extend = function(child, parent) {
    for (let key in parent) {
        if (hasProp.call(parent, key)) {child[key] = parent[key];}
    }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
}

let TimeoutError = exports.TimeoutError = function (message) {
    if (!(this instanceof TimeoutError)) {
        return new TimeoutError(message);
    }
    if(Error.captureStackTrace) {
        // This is better, because it makes the resulting stack trace have the correct error name.  But, it
        // only works in V8/Chrome.
        TimeoutError.__super__.constructor.apply(this, arguments);
        Error.captureStackTrace(this, this.constructor);
    } else {
        // Hackiness for other browsers.
        this.stack = (new Error(message)).stack;
    }
    this.message = message;
    this.name = "TimeoutError";
}
extend(TimeoutError, Error);

/*
 * Returns a Promise which resolves after `ms` milliseconds have elapsed.  The returned Promise will never reject.
 */
exports.delay = (ms) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

/*
 * Returns a `{promise, resolve, reject}` object.  The returned `promise` will resolve or reject when `resolve` or
 * `reject` are called.
 */
exports.defer = () => {
    let answer = {};
    answer.promise = new Promise((resolve, reject) => {
        answer.resolve = resolve;
        answer.reject = reject;
    });
    return answer;
};

/*
 * Given an array, `tasks`, of functions which return Promises, executes each function in `tasks` in series, only
 * calling the next function once the previous function has completed.
 */
exports.series = (tasks) => {
    let results = [];
    return tasks.reduce(
        (series, task) =>
            series.then(task)
            .then((result) => {
                results.push(result);
            }),
        Promise.resolve()
    ).then(() => results);
};

/*
 * Given an array, `tasks`, of functions which return Promises, executes each function in `tasks` in parallel.
 * If `limit` is supplied, then at most `limit` tasks will be executed concurrently.
 */
exports.parallel = exports.parallelLimit = (tasks, limit) => {
    if (!limit || limit < 1 || limit >= tasks.length) {
        return Promise.all(tasks.map((task) => Promise.resolve().then(task)));
    }

    return new Promise((resolve, reject) => {
        let results = [];

        let currentTask = 0;
        let running = 0;
        let errored = false;

        let startTask = () => {
            if (errored) {return;}
            if (currentTask >= tasks.length) {return;}

            let taskNumber = currentTask++;
            let task = tasks[taskNumber];
            running++;

            Promise.resolve()
            .then(task)
            .then(
                (result) => {
                    results[taskNumber] = result;
                    running--;
                    if(currentTask < tasks.length && running < limit) {
                        startTask();
                    } else if (running === 0) {
                        resolve(results);
                    }
                },
                (err) => {
                    if (errored) {return;}
                    errored = true;
                    reject(err);
                }
            );
        };

        // Start up `limit` tasks.
        for(let i = 0; i < limit; i++) {
            startTask();
        }
    });
};

/*
 * Add a timeout to an existing Promise.
 *
 * Resolves to the same value as `p` if `p` resolves within `ms` milliseconds, otherwise the returned Promise will
 * reject with the error "Timeout: Promise did not resolve within ${ms} milliseconds"
 */
exports.timeout = (p, ms) =>
    new Promise((resolve, reject) => {
        let timer = setTimeout(() => {
            timer = null;
            reject(new exports.TimeoutError(`Timeout: Promise did not resolve within ${ms} milliseconds`));
        }, ms);

        p.then(
            (result) => {
                if(timer !== null) {
                    clearTimeout(timer);
                    resolve(result);
                }
            },
            (err) => {
                if(timer !== null) {
                    clearTimeout(timer);
                    reject(err);
                }
            }
        );
    });

/*
 * Continually call `fn()` while `test()` returns true.
 *
 * `fn()` should return a Promise.  `test()` is a synchronous function which returns true of false.
 *
 * `whilst` will resolve to the last value that `fn()` resolved to, or will reject immediately with an error if
 * `fn()` rejects or if `fn()` or `test()` throw.
 */
exports.whilst = (test, fn) =>
    new Promise((resolve, reject) => {
        let lastResult = null;
        let doIt = () => {
            try {
                if(test()) {
                    Promise.resolve()
                    .then(fn)
                    .then(
                        (result) => {
                            lastResult = result;
                            setTimeout(doIt, 0);
                        },
                        reject
                    );
                } else {
                    resolve(lastResult);
                }
            } catch (err) {
                reject(err);
            }
        };

        doIt();
    });

exports.doWhilst = (fn, test) => {
    let first = true;
    let doTest = () => {
        let answer = first || test();
        first = false;
        return answer;
    };
    return exports.whilst(doTest, fn);
};
