'use strict'

function parseBool(input) {
  if (/^\s*(?:true|yes|on)\s*$/i.test(input)) {
    return true
  } else if (/^\s*(?:false|no|off)\s*$/i.test(input)) {
    return false
  }

  return undefined
}

class Config {
  get debug() {
    return Config.bool('lordown.debug', false)
  }

  get footnote() {
    return Config.bool('lordown.footnote', true)
  }

  get footnoteCaption() {
    return Config.get('lordown.footnote.caption', 'Сноски')
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

  static get(key, def=undefined) {
    if (!Config.available) return def

    const value = localStorage.getItem(key)
    return value === null ? def : value
  }

  static bool(key, def=undefined) {
    const value = parseBool(Config.get(key))
    return value === undefined ? def : value
  }
}

module.exports = Config
