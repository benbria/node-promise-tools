'use strict';

let {exec} = require('child_process');
let path = require('path');
let {expect} = require('chai');

describe('Typescript', () => {
    describe('build', () => {
        it('must build without error', function (done) {
            this.timeout(10000);
            exec('tsc --noEmit', {cwd: 'test', }, function (error) {
                expect(error).to.eq(null);
                done();
            });
        });
    });
});
