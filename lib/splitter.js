'use strict';

const Token = require('markdown-it/lib/token')

const arrayReplaceAt = require('markdown-it/lib/common/utils').arrayReplaceAt

/**
 * Create a split rule.
 *
 * @param {RegExp} re - regular expression to split text.
 * @param {function} tokenBuilder - function to build a token from the matched text.
 *
 * @return {function}
 */
function splitter(re, tokenBuilder) {
  function split(token) {
    let text = token.content
    const level = token.level

    let match
    let lastIndex

    const nodes = []

    // Iterate matched text
    while ((match = re.exec(text))) {
      const capture = match[1] || match[0]
      const capturePos = match.index + match[0].indexOf(capture)
      const startPos = lastIndex || 0

      // Has preceding text, save it as a separate text token
      if (capturePos > startPos) {
        const precedingText = new Token('text', '', 0)
        precedingText.content = text.slice(startPos, capturePos)
        precedingText.level = level
        nodes.push(precedingText)
      }

      lastIndex = re.lastIndex

      // Save matched text as a separate token
      const matchedToken = tokenBuilder(capture, token, match)
      nodes.push(matchedToken)
    }

    // No matches
    if (lastIndex === undefined) return null

    const trailingText = text.slice(lastIndex)

    // Has trailing text, save it as a separate text token
    if (trailingText.length > 0) {
      const trailingTextToken = new Token('text', '', 0)
      trailingTextToken.content = trailingText
      trailingTextToken.level = level
      nodes.push(trailingTextToken)
    }

    return nodes
  }

  function splitRule(state) {
    const tokens = state.tokens

    // Iterate over inline tokens
    for (let token of tokens) {
      if (token.type !== 'inline') continue

      let children = token.children

      // Iterate over text children
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]

        if (child.type !== 'text') continue

        const nodes = split(child)

        if (nodes) {
          token.children = children = arrayReplaceAt(children, i, nodes)
        }
      }
    }
  }

  return splitRule
}

module.exports = splitter
