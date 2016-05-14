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
  const addTag = (tag, open, close) => {
    const openRule = typeof open === 'string' ? () => open : open
    const closeRule = typeof close === 'string' ? () => close : close

    const single = close === undefined || close === null

    renderer.rules[`${tag}${single ? '' : '_open'}`] = openRule

    if (!single) {
      renderer.rules[`${tag}_close`] = closeRule
    }
  }

  addTag('code_inline', (tokens, idx) => `[inline]${tokens[idx].content}[/inline]`)
  addTag('code_block', (tokens, idx) => `[code]${tokens[idx].content}[/code]\n`)
  addTag('fence', (tokens, idx) => {
    const token = tokens[idx]
    const info = token.info ? token.info.trim() : ''
    const lang = info.split(/\s+/g)[0]
    const openTag = lang ? `[code=${lang}]` : '[code]'

    return `${openTag}${token.content}[/code]\n`
  })

  addTag('paragraph', '', '\n\n')
  addTag('strong', '[strong]', '[/strong]')
  addTag('em', '[em]', '[/em]')
  addTag('blockquote', '[quote]', '[/quote]')
  addTag('s', '[s]', '[/s]')
  addTag('ordered_list', '[list=1]', '[/list]')
  addTag('bullet_list', '[list]', '[/list]')
  addTag('list_item', '[*]', '')
  addTag('link', (tokens, idx) => `[url=${getAttr(tokens[idx], 'href')}]`, '[/url]')
  addTag('heading', '[strong]', '[/strong]\n\n')
}

module.exports = lordownRenderer
