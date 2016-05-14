'use strict';

const babelify = require('babelify')
const browserify = require('browserify')
const eslint = require('gulp-eslint')
const concat = require('gulp-concat')
const gulp = require('gulp')
const mocha = require('gulp-mocha')
const source = require('vinyl-source-stream')
const yargs = require('yargs')

const pkg = require('./package.json')

function metadata(pairs) {
  let meta = '// ==UserScript==\n'
  for (let key in pairs) {
    const values = [].concat(pairs[key])
    for (let value of values) {
      meta += `// @${key} ${value}\n`
    }
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
    include: ['https://www.linux.org.ru/*', 'http://www.linux.org.ru/*'],
    downloadURL: 'https://gitlab.com/smaximov/lordown/raw/master/dist/lordown.user.js',
    updateURL: 'https://gitlab.com/smaximov/lordown/raw/master/dist/lordown.meta.js'
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
      require: ['./test/helper.js'],
      grep: yargs.argv.grep
    }))
})

gulp.task('lint', () => {
  return gulp.src(['**/*.js', '!node_modules/**', '!dist/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('watch', () => {
  return gulp.watch(['lib/**/*.js', 'test/**/*.js'], ['test', 'lint'])
})

gulp.task('default', ['watch', 'test', 'lint'])
