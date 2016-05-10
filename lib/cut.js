'use strict'

function cut(md) {
  md.use(require('markdown-it-container'), 'cut', {
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
}

module.exports = cut
