'use strict';

const babelify = require('babelify')
const browserify = require('browserify')
const concat = require('gulp-concat')
const gulp = require('gulp')
const mocha = require('gulp-mocha')
const source = require('vinyl-source-stream')

const pkg = require('./package.json')

function metadata(pairs) {
  let meta = '// ==UserScript==\n'
  for (let key in pairs) {
    meta += `// @${key} ${pairs[key]}\n`
  }
  meta += '// ==/UserScript==\n'

  return meta
}

gulp.task('meta', () => {
  const meta = {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    grant: 'none',
    namespace: 'https://www.linux.org.ru',
    include: 'https://www.linux.org.ru/*'
  }

  const stream = source('lordown.meta.js')
  stream.end(metadata(meta))
  return stream.pipe(gulp.dest('./dist/'))
})

gulp.task('bundle', () => {
  return browserify('./userscript/index.js')
    .transform(babelify, { presets: ["es2015"] })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('userscript', ['meta', 'bundle'], () => {
  return gulp.src(['./dist/lordown.meta.js', './dist/bundle.js'])
    .pipe(concat('lordown.user.js'))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('test', () => {
  return gulp.src('test/**/test_*.js')
    .pipe(mocha({
      ui: 'bdd',
      require: ['./test/helper.js']
    }))
})

gulp.task('watch', ['test'], () => {
  return gulp.watch('lib/*.js', ['test'])
})
