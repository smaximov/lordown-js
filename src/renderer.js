'use strict';

const Renderer = require('markdown-it/lib/renderer')
const Token = require('markdown-it/lib/token')

/**
 * Get token attribute by name.
 *
 * @param {string} name - attribute name.
 * @return {?string}
 */
Token.prototype.getAttr = function(name) {
  const idx = this.attrIndex(name)
  return idx !== -1 ? this.attrs[idx][1] : null
}

/**
 * LORCODE renderer.
 */
class LordownRenderer extends Renderer {
  /**
   * Create a new {@link LordownRenderer} with custom rules.
   */
  constructor() {
    super()

    this.rules['code_inline'] = (tokens, idx) => `[inline]${tokens[idx].content}[/inline]`
    this.rules['code_block'] = (tokens, idx) => `[code]${tokens[idx].content}[/code]\n`
    this.rules['fence'] = (tokens, idx) => {
      const token = tokens[idx]
      const info = token.info ? token.info.trim() : ''
      const lang = info.split(/\s+/g)[0]
      const openTag = lang ? `[code=${lang}]` : '[code]'

      return `${openTag}${token.content}[/code]\n`
    }

    this.addTag('paragraph', '', '\n\n')
    this.addTag('strong', '[strong]', '[/strong]')
    this.addTag('em', '[em]', '[/em]')
    this.addTag('blockquote', '[quote]', '[/quote]')
    this.addTag('s', '[s]', '[/s]')
    this.addTag('ordered_list', '[list=1]', '[/list]')
    this.addTag('bullet_list', '[list]', '[/list]')
    this.addTag('list_item', '[*]', '')
    this.addTag('link', (tokens, idx) => `[url=${tokens[idx].getAttr('href')}]`, '[/url]')
  }

  /**
   * Add matching open-close rules for a  tag.
   *
   * @param {string} tag - tag name.
   * @param {string|function} open - tag open rule.
   * @param {string|function} close - tag close rule.
   */
  addTag(tag, open, close) {
    const openRule = typeof open === 'string' ? () => open : open
    const closeRule = typeof close === 'string' ? () => close : close

    this.rules[`${tag}_open`] = openRule
    this.rules[`${tag}_close`] = closeRule
  }
}

module.exports = LordownRenderer
