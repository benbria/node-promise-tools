// Type definitions for promise-tools
// Project: node-promise-tools
// Definitions by: Calvin Wiebe calvin.wiebe@gmail.com

declare class TimeoutError extends Error {}
type PromiseGeneratingFunction<t> = () => Promise<t>;

/**
 * Returns a Promise which resolves after `ms` milliseconds have elapsed.  The returned Promise will never reject.
 */
export function delay(ms: number): Promise<void>;

type Deferred<t> = {
    promise: Promise<t>;
    resolve: (result: t) => t;
    reject: (error: any) => any;
};
/**
 * Returns a `{promise, resolve, reject}` object.  The returned `promise` will resolve or reject when `resolve` or
 * `reject` are called.
 */
export function defer<t>(): Deferred<t>;

/**
 * Given an array, `tasks`, of functions which return Promises, executes each function in `tasks` in series, only
 * calling the next function once the previous function has completed.
 */
export function series<t>(tasks: PromiseGeneratingFunction<t>[]): Promise<t[]>;

/**
 * Given an array, `tasks`, of functions which return Promises, executes each function in `tasks` in parallel.
 * If `limit` is supplied, then at most `limit` tasks will be executed concurrently.
 */
export function parallel<t>(tasks: PromiseGeneratingFunction<t>[], limit?: number): Promise<t[]>;


type MapIterator<t> = (item: t, index: number) => Promise<t>;
/**
 * Given an array `arr` of items, calls `iter(item, index)` for every item in `arr`.  `iter()` should return a
 * Promise.  Up to `limit` items will be called in parallel (defaults to 1.)
 */
export function map<t>(arr: t[], iter: MapIterator<t>, limit?: number): Promise<t[]>;

/**
 * Add a timeout to an existing Promise.
 *
 * Resolves to the same value as `p` if `p` resolves within `ms` milliseconds, otherwise the returned Promise will
 * reject with the error "Timeout: Promise did not resolve within ${ms} milliseconds"
 */
export function timeout<t>(p: Promise<t>, ms: number): Promise<t>;

/**
 * Continually call `fn()` while `test()` returns true.
 *
 * `fn()` should return a Promise.  `test()` is a synchronous function which returns true of false.
 *
 * `whilst` will resolve to the last value that `fn()` resolved to, or will reject immediately with an error if
 * `fn()` rejects or if `fn()` or `test()` throw.
 */
export function whilst<t>(test: () => boolean, fn: PromiseGeneratingFunction<t>): Promise<t>;

/**
 * Same as `whilst` but will call `test()` before trying `fn`
 */
export function doWhilst<t>(fn: PromiseGeneratingFunction<t>, test: () => boolean): Promise<t>;

/**
 * Function to be called until resolves by `retry`. It will be passed the `lastAttempt` failure of the previous call.
 */
type RetryTask<t> = (lastAttempt: any) => Promise<t>;

/**
 * Options for the retry method
 */
type RetryOptions = number | {
    times: number,
    interval: number
}

/**
 * Will call `fn` 5 times until it resolves. If after 5 tries `fn` still rejects, `retry` will reject
 * with the last error
 */
export function retry<t>(fn: RetryTask<t>): Promise<t>;

/**
 * Continually call `fn` until it resolves. `retry` will call it `options.times` before giving up and rejecting. The
 * default amount of times is 5. You can set it to `Infinity` to try forever. The interval between each retry is 0,
 * unless specified in milliseconds in `options.interval`.
 */
export function retry<t>(options: Partial<RetryOptions>, fn: RetryTask<t>): Promise<t>;
