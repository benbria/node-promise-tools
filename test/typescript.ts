import * as pt from '../';

let promises: Promise<any>[] = [];

promises.push(pt.retry<Number>((): Promise<Number> => {
    return Promise.resolve(1);
}));

promises.push(pt.retry<String>({times: Infinity, interval: 5000}, (): Promise<String> => {
    return Promise.resolve('what');
}));

promises.push(pt.retry<String>(2, (): Promise<String> => {
    return Promise.resolve('what');
}));

promises.push(pt.delay(1000).then(() => console.log('done delay')));

const deferred = pt.defer<string>();

promises.push(deferred.promise.then((something) => { something.charAt(0); }));

deferred.resolve('what');

const pSeries = pt.series<any>([
    () => (Promise.resolve('1')),
    () => (Promise.resolve(2))
]);

promises.push(pSeries);

const pParallel = pt.parallel<string>([
    () => (Promise.resolve('1')),
    () => (Promise.resolve('3'))
], 0);

promises.push(pParallel);

const pMap = pt.map([1, 2, 3, 3], (item, index) => (Promise.resolve(item * item)), 0);

promises.push(pMap);

promises.push(pt.timeout(pt.delay(1000).then(() => 999), 2000));

let tries = 0;
const pWhilst = pt.whilst(() => (tries < 3), () => {
    tries++;
    return Promise.resolve(tries * 2);
});
promises.push(pWhilst);

let tries2 = 0;
const pDoWhilst = pt.doWhilst<number>(() => {
    tries2++;
    return Promise.resolve(tries2 * 2);
}, () => (tries2 < 3));
promises.push(pDoWhilst);

Promise.all(promises)
.then(result => {
    console.log(result);
});

const error = new pt.TimeoutError();

console.log(error instanceof Error);
