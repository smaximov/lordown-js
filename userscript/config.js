'use strict'

function parseBool(input) {
  if (/^\s*(?:true|yes|on)\s*$/i.test(input)) {
    return true
  } else if (/^\s*(?:false|no|off)\s*$/i.test(input)) {
    return false
  }

  return undefined
}

function set(key, val, validateTransform) {
  if (!Config.available) return

  const k = `lordown.${key}`

  if (val === null) {
    localStorage.removeItem(k)
    return
  }

  const v = validateTransform(val)

  if (v === undefined || v === null) return

  localStorage.setItem(k, v)
}

function setBool(key, val) {
  set(key, val, (val) => typeof val === 'boolean' ? val.toString() : undefined)
}

function get(key, def=undefined) {
  if (!Config.available) return def

  const value = localStorage.getItem(`lordown.${key}`)
  return value === null ? def : value
}

function bool(key, def=undefined) {
  const value = parseBool(get(key))
  return value === undefined ? def : value
}

const modifiersMap = {
  ctrl: 'ctrlKey',
  meta: 'altKey',
  shift: 'shiftKey',
  alt: 'altKey',
}

const validModifiers = Object.keys(modifiersMap)

class Config {
  get debug() {
    return bool('debug', false)
  }

  set debug(value) {
    setBool('debug', value)
  }

  get footnote() {
    return bool('footnote', true)
  }

  set footnote(value) {
    setBool('footnote', value)
  }

  get footnoteCaption() {
    return get('footnote.caption', '——————————')
  }

  set footnoteCaption(value) {
    set('footnote.caption', value, (value) => {
      return typeof value === 'string' ? value : undefined
    })
  }

  get indent() {
    return bool('indent', true)
  }

  set indent(value) {
    setBool('indent', value)
  }

  get indentModifier() {
    return modifiersMap[get('indent.modifier', 'ctrl')] || 'ctrlKey'
  }

  set indentModifier(value) {
    set('indent.modifier', value, (value) => {
      return validModifiers.indexOf(value) < 0 ? undefined : value
    })
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Testing_for_support_vs_availability
  static get available() {
    try {
      const storage = window.localStorage
      const x = '__storage_test__'
      storage.setItem(x, x)
      storage.removeItem(x)
      return true
    }
    catch(e) {
      return false
    }
  }
}

module.exports = Config
