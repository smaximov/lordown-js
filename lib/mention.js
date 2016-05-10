const splitter = require('./splitter')

const nickLetter = '-a-z-A-Z0-9_'
const mentionRe = new RegExp(`(?:^|[^${nickLetter}])(@[${nickLetter}]+)`, 'g')

function mention(md) {
  splitter(md, 'mention', mentionRe, (capture, token, Token) => {
      const mention = new Token('mention', '', 0)
      mention.content = capture.slice(1)
      mention.markup = '@'
      mention.level = token.level
      return mention
    })
}

module.exports = mention
