'use strict';

/**
 * Markdown to LORCODE converter.
 */
function lordown(md) {
  md.use(require('./renderer'))
    .use(require('./cut'))
    .use(require('./mention'))
    .disable(['table'])
}

/**
 * Preferred MarkdownIt options to use
 */
const options = {
  html: true,
  typographer: true,
  linkify: true
}

exports.OPTIONS = options

exports.plugin = lordown
