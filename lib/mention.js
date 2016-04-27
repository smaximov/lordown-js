'use strict';

// Taken from https://github.com/flowdock/markdown-it-flowdock/

const nickLetter = '-a-z-A-Z0-9_'
const re = new RegExp(`(?:^|[^${nickLetter}])(@[${nickLetter}]+)`, 'g')

function split(token, Token) {
  let text = token.content
  const level = token.level

  // Search for the @mention syntax
  const matches = text.match(re)

  if (matches === null) return null

  const nodes = []

  // Iterate matches
  for (let match of matches) {
    const start = match.search('@')
    const user = match.slice(start + 1)
    const pos = text.indexOf(match) + start

    // Has preceding text, save it as a separate text token
    if (pos > 0) {
      const precedingText = new Token('text', '', 0)
      precedingText.content = text.slice(0, pos)
      precedingText.level = level
      nodes.push(precedingText)
    }

    // Save @mention as a separate token
    const mention = new Token('mention', '', 0)
    mention.content = user
    mention.markup = '@'
    mention.level = level
    nodes.push(mention)

    text = text.slice(pos + 1 + user.length)
  }

  // Has trailing text, save it as a separate text token
  if (text.length > 0) {
    const trailingText = new Token('text', '', 0)
    trailingText.content = text
    trailingText.level = level
    nodes.push(trailingText)
  }

  return nodes
}

/**
 * Mention plugin
 */
function mention(md) {
  function mentionRule(state) {
    const tokens = state.tokens

    // Iterate over inline tokens
    for (let token of tokens) {
      if (token.type !== 'inline') continue

      let children = token.children

      // Iterate over text children
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]

        if (child.type !== 'text') continue

        // Skip content of links
        if (child.type === 'link_close') {
          do {
            i--
          } while(children[i].level !== child.level && children[i].type !== 'link_open')
          continue
        }

        const nodes = split(token, state.Token)

        if (nodes) {
          token.children = children = md.utils.arrayReplaceAt(children, i, nodes)
        }
      }
    }
  }

  md.core.ruler.push('mention', mentionRule)
}

module.exports = mention
