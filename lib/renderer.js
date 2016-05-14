'use strict';

/**
 * LORCODE renderer plugin.
 */
function lordownRenderer(md) {
  const renderer = md.renderer

  // Get token attribute by name
  const getAttr = (token, name) => {
    const idx = token.attrIndex(name)
    return idx !== -1 ? token.attrs[idx][1] : null
  }

  // Add `${tag}` (or `${tag}_open`, `${tag}_close`) rules for a tag
  const rule = (tag, open, close) => {
    const openRule = typeof open === 'string' ? () => open : open
    const closeRule = typeof close === 'string' ? () => close : close
    const single = close === undefined || close === null

    renderer.rules[`${tag}${single ? '' : '_open'}`] = openRule

    if (!single) {
      renderer.rules[`${tag}_close`] = closeRule
    }
  }

  rule('code_inline', (tokens, idx) => `[inline]${tokens[idx].content}[/inline]`)
  rule('code_block', (tokens, idx) => `[code]${tokens[idx].content}[/code]\n`)
  rule('fence', (tokens, idx) => {
    const token = tokens[idx]
    const info = token.info ? token.info.trim() : ''
    const lang = info.split(/\s+/g)[0]
    const openTag = lang ? `[code=${lang}]` : '[code]'

    return `${openTag}${token.content}[/code]\n`
  })

  rule('paragraph', '', '\n\n')
  rule('strong', '[strong]', '[/strong]')
  rule('em', '[em]', '[/em]')
  rule('blockquote', '[quote]', '[/quote]')
  rule('s', '[s]', '[/s]')
  rule('ordered_list', '[list=1]', '[/list]')
  rule('bullet_list', '[list]', '[/list]')
  rule('list_item', '[*]', '')
  rule('link', (tokens, idx) => `[url=${getAttr(tokens[idx], 'href')}]`, '[/url]')
  rule('heading', '[strong]', '[/strong]\n\n')
  rule('hr', (tokens, idx) => `${tokens[idx].markup}\n\n`)
  rule('image', (tokens, idx, options, env) => {
    const token = tokens[idx]
    const src = getAttr(token, 'src')
    const alt = token.children.length === 0
            ? src
            : renderer.renderInlineAsText(token.children, options, env)
    return `[url=${src}]${alt}[/url]`
  })
}

module.exports = lordownRenderer
