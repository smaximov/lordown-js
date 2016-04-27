'use strict';

const MarkdownIt = require('markdown-it')

const LordownRenderer = require('./renderer')

/**
 * Markdown to LORCODE converter.
 */
class Lordown {
  /**
   * Create a new instance of {@link Lordown}.
   */
  constructor() {
    this.md = new MarkdownIt({
      html: true,
      typographer: true,
      linkify: true
    }).use(require('markdown-it-container'), 'cut', {
      validate: () => true
    }).use(require('./mention'))

    this.md.renderer = new LordownRenderer
  }

  /**
   * Convert Markdown to LORCODE.
   *
   * @param {string} input
   * @return {string}
   */
  convert(input) {
    return this.md.render(input)
  }

  /**
   * Parse Markdown into a token stream (for debugging only).
   */
  parse(input) {
    return this.md.parse(input)
  }
}

module.exports = Lordown
