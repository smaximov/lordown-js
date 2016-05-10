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
    })

    this.md.renderer = new LordownRenderer

    this.md.use(require('markdown-it-container'), 'cut', {
      validate() {
        return true
      },
      render(tokens, idx) {
        const token = tokens[idx]

        if (token.nesting === 1) {
          //Opening tag
          const info = token.info.trim()
          const cutSummary = info.length > 0 ? `=${info}` : ''
          return `[cut${cutSummary}]`
        } else {
          // Closing tag
          return `[/cut]`
        }
      }
    })

    this.md
      .use(require('./mention'))
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
