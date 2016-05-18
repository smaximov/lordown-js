'use strict'

function splice(str, start, count, ...replacements) {
  const arr = str.split('')
  arr.splice(start, count, ...replacements)
  return arr.join('')
}

function truncate(text, width) {
  return `${text.slice(0, width)}${text.length > width ? '...' : ''}`
}

exports.splice = splice
exports.truncate = truncate
