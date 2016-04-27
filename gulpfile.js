'use strict';

const gulp = require('gulp')
const mocha = require('gulp-mocha')

gulp.task('test', () => {
  return gulp.src('test/**/test_*.js')
    .pipe(mocha({
      ui: 'bdd',
      require: ['./test/helper.js']
    }))
})
