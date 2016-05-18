'use strict'

function footnote(md, footnoteCaption) {
  md.use(require('markdown-it-footnote'))

  const rules = md.renderer.rules

  rules.footnote_ref = (tokens, idx) => `[${tokens[idx].meta.id + 1}]`
  rules.footnote_block_open = () => `[strong]${footnoteCaption}[/strong]\n\n[list=1]`
  rules.footnote_block_close = () => '[/list]\n\n'
  rules.footnote_open = () => '[*]'
  rules.footnote_close = () => ''
  rules.footnote_anchor = () => ''
}

module.exports = footnote
