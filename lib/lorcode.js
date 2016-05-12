'use strict'

const tagRe = /^\[\*\]/

const splitter = require('./splitter.js')

/**
 * Plugin to parse LORCODE tags
 */
function lorcode(md) {
  const splitRule = splitter(tagRe, {
    validate(state) {
      return state.src[state.pos] === '['
    },
    matched(capture, state) {
      const tag = state.push('lorcode_tag', '', 0)
      tag.content = capture
    }
  })

  md.inline.ruler.after('backticks', 'lorcode', splitRule)
  md.renderer.rules['lorcode_tag'] = (tokens, idx) => tokens[idx].content
}

module.exports = lorcode
