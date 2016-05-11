'use strict';

/**
 * Create a split rule.
 */
function splitter(re, options) {
  const matched = options.matched
  const validate = typeof options.validate == 'function' ? options.validate : () => true

  function splitRule(state) {
    if (!validate(state)) return false

    const src = state.src
    const pos = state.pos
    const tail = src.slice(pos)

    const match = re.exec(tail)
    if (match === null) return false

    matched(match[0], state)

    state.pos += match[0].length

    return true
  }

  return splitRule
}

module.exports = splitter
