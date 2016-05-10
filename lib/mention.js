'use strict'

const Token = require('markdown-it/lib/token')

const splitter = require('./splitter')

const nickLetter = '-a-z-A-Z0-9_'
const mentionRe = new RegExp(`(?:^|[^${nickLetter}])(@[${nickLetter}]+)`, 'g')

function mention(md) {
  const splitRule = splitter(mentionRe, (capture, token) => {
    const mention = new Token('mention', '', 0)
    mention.content = capture.slice(1)
    mention.markup = '@'
    mention.level = token.level
    mention.nesting = 0
    return mention
  })

  md.core.ruler.push('mention', splitRule)
  md.renderer.rules['mention'] = (tokens, idx) => `[user]${tokens[idx].content}[/user]`
}

module.exports = mention
