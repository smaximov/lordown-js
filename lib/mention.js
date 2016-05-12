'use strict'

const splitter = require('./splitter')

const nickLetter = '-a-z-A-Z0-9_'

// Regex to match @user syntax
const mentionRe = new RegExp(`^@[${nickLetter}]+`)

// Not a valid trailing character of the local part of email addresses
const precedingRe = /[^-A-Za-z!#$%&'*+\/=?^_`{|}~)]/

/**
 * Plugin to parse users mentions (@user)
 */
function mention(md) {
  const splitRule = splitter(mentionRe, {
    validate(state) {
      const src = state.src
      const pos = state.pos
      const chr = src[pos]
      const pre = src[pos - 1]

      return chr === '@' && (pre === undefined || precedingRe.test(pre))
    },
    matched(capture, state) {
      const mention = state.push('mention', '', 0)
      mention.content = capture.slice(1)
      mention.markup = 'user'
    }
  })

  md.inline.ruler.before('emphasis', 'mention', splitRule)
  md.renderer.rules['mention'] = (tokens, idx) => `[user]${tokens[idx].content}[/user]`
}

module.exports = mention
