'use strict';

/**
 * Markdown to LORCODE converter.
 */
function lordown(md, options) {
  options = options || {}

  md.use(require('./renderer'))
    .use(require('./cut'))
    .use(require('./mention'))

  if (options.footnote === true) {
    md.use(require('./footnote'), options.footnoteCaption)
  }

  md.disable(['table'])
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
