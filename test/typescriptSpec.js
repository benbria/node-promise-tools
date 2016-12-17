'use strict';

let {exec} = require('child_process');
let {expect} = require('chai');

// This just makes sure the `typescript.ts` file compiles
describe('Typescript', () => {
    describe('build', () => {
        it('must build without error', function(done) {
            this.timeout(10000);
            exec('tsc --noEmit', {cwd: 'test'}, (error) => {
                expect(error).to.eq(null);
                done();
            });
        });
    });
});
