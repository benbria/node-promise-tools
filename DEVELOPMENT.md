The intention here is to mirror the API of other existing projects, such as
[bluebird](https://github.com/petkaantonov/bluebird) and [q](https://github.com/kriskowal/q), but to make this
agnostic to the Promise implementation.  When adding a new function, try to use the same API as these other libraries,
to make migration to `promise-tools` easy.  You can assume that `Promise` has any and all functions available
in the ECMAScript 2015 standard.

All source files should run in the latest node.js without any translation using `babel`.  We do use `babel` to
generate ES5 source files in `lib`, and this is what gets distributed, but `npm run quicktest` will attempt to
run tests without involving `babel` (as `bable` is quite slow.)  Note that all tests are run on the CI server
using babel translated code.
