'use strict'

const Token = require('markdown-it/lib/token')

const splitter = require('./splitter')

const lorcodeTagRe = new RegExp(String.raw `\[\*\]`, 'g')

function lorcodeSimple(md) {
  const splitRule = splitter(lorcodeTagRe, (capture, token) => {
    const tag = new Token('lorcode-tag')
    tag.content = capture
    tag.level = token.level
    return tag
  })

  md.inline.ruler.after('backticks', 'lorcode-simple', splitRule)
  md.renderer.rules['lorcode-tag'] = (tokens, idx) => tokens[idx].content
}

module.exports = lorcodeSimple
