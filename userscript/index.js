const Config = require('./config')
const lordown = require('../lib')
const util = require('./util')

const MarkdownIt = require('markdown-it')

const config = new Config
const ld = new MarkdownIt(lordown.OPTIONS)

ld.use(lordown.plugin, {
  footnote: config.footnote,
  footnoteCaption: config.footnoteCaption
})

function debug(what, ...args) {
  if (config.debug) {
    console.debug(`lordown :: ${what}${args.length === 0 ? '' : ' ::'}`, ...args) // eslint-disable-line no-console
  }
}

function handle(element, event, handler, options={}) {
  const doHandle = typeof options.when === 'function' ? options.when : () => true
  const doLog = typeof options.log === 'boolean' ? options.log : true

  if (doLog) {
    debug('handle', `add '${event}' event listener for`, element)
  }

  element.addEventListener(event, (e) => {
    if (doHandle(e)) {
      if (doLog) {
        debug('handle', `handle '${event}' event for`,  element)
      }

      return handler(e)
    }
    return undefined
  }, false)
}

function choice(...ids) {
  for (let id of ids) {
    let result = document.getElementById(id)
    if (result !== null) {
      debug('choice', `found an element with the id '${id}'`)
      return result
    }
  }

  debug('choice', `no elements found with ids [${ids.join(', ')}]`)

  return null
}

function clone(node, updateAttr={}) {
  const result = node.cloneNode()
  for (let attr in updateAttr) {
    const val = updateAttr[attr]

    if (val === null) {
      result.removeAttribute(attr)
    } else {
      result.setAttribute(attr, val)
    }
  }

  return result
}

class KeyboardEventDispatcher {
  constructor(element) {
    this.element = element
    this.handlers = []

    handle(this.element, 'keydown', (event) => {
      for (let handler of this.handlers) {
        if (handler.when(event)) {
          event.preventDefault()
          return
        }
      }
    }, {
      log: false
    })

    handle(this.element, 'keyup', (event) => {
      for (let handler of this.handlers) {
        if (handler.when(event)) {
          handler.run(event)
        }
      }
    }, {
      log: false
    })
  }

  handle(handler, when) {
    this.handlers.push({
      run: handler,
      when: when,
    })
  }
}

class ToggleButton {
  constructor(initialState, caption, onToggle) {
    this._enabled = initialState
    this._element = document.createElement('a')
    this._element.textContent = caption
    this._element.classList.add('lordown-button')

    handle(this._element, 'click', () => {
      this._enabled = !this._enabled
      this._element.classList.toggle('lordown-button-disabled')
      onToggle(this._enabled)
    })
  }

  get enabled() {
    return this._enabled
  }

  get element() {
    return this._element
  }

  appendTo(parent) {
    parent.appendChild(this._element)
  }
}

function setVisible(element, visible) {
  element.style.display = visible ? 'inline-block' : 'none'
}

function extendedRegion(textarea) {
  const source = textarea.value
  let start = textarea.selectionStart
  let end = textarea.selectionEnd

  while (start > 0 && source[start - 1] !== '\n') --start
  while (source.length > end && source[end] !== '\n') ++end

  return {
    start: start,
    end: end,
    length: end - start,
    source: source,
    text: source.slice(start, end)
  }
}

function transformRegion(textarea, re, replace) {
  const region = extendedRegion(textarea)

  let replacement
  let offset = null
  let delta = 0

  replacement = region.text.replace(re, (...args) => {
    const result = replace(...args)

    if (offset === null) offset = result.delta
    delta += result.delta
    return result.text
  })

  const start = textarea.selectionStart + (offset || 0)
  const end = textarea.selectionEnd + delta

  textarea.value = util.splice(region.source, region.start, region.length, replacement)
  textarea.selectionStart = start
  textarea.selectionEnd = end
}

function init(form) {
  if (form === null) {
    debug('init', 'comment form not found')
    return
  }

  if (choice('edit') !== null) {
    debug('init', 'editing comments not implemented, disable Lordown')
    return
  }

  const msg = choice('msg', 'form_msg')

  if (msg === null) {
    debug('init', 'comment textarea not found')
    return
  }

  const markdownMsg = clone(msg, {
    id: 'lordown-msg',
    name: 'lordown-msg'
  })

  msg.parentNode.insertBefore(markdownMsg, msg)
  msg.style.display = 'none'

  // Button to toggle lordown on/off
  const lordownButton = new ToggleButton(true, 'Lordown', (enabled) => {
    debug('toggle', `lordown is ${enabled ? 'enabled' : 'disabled'}`)

    setVisible(msg, !enabled)
    setVisible(markdownMsg, enabled)
  })
  lordownButton.appendTo(form.querySelector(`label[for=${msg.id}]`))

  const convert = () => {
    if (lordownButton.enabled) {
      const start = Date.now()
      msg.value = ld.render(markdownMsg.value)
      const end = Date.now()
      debug('convert',`${end - start} ms`)
    }
  }

  // Async previews use XHR instead of submit
  const previewButton = form.querySelector('button[name=preview]')
  if (previewButton !== null) {
    // Use `mousedown` instead of `click` since it's fired first
    handle(previewButton, 'mousedown', convert)
  }

  const submit = form.querySelector('button:not(name)')

  const keyHandler = new KeyboardEventDispatcher(markdownMsg)

  // Handle Ctrl+Enter (submit)
  // Cloning an element discards its event listeners,
  // so we are going to trigger `submit` manually via `click`.
  keyHandler.handle(() => {
    submit.click()
  }, (event) => {
    // Ctrl + Enter
    return event.keyCode === 13 && event.ctrlKey
  })

  // Handle indent/unindent
  keyHandler.handle((event) => {
    if (!config.indent) return

    const indent = event.keyCode === 39

    if (indent) {
      transformRegion(markdownMsg, /^/mg, () => {
        return {
          text: '    ',
          delta: 4,
        }
      })
    } else {
      transformRegion(markdownMsg, /^( {0,4})/mg, (_match, spaces) => {
        return {
          text: '',
          delta: -spaces.length,
        }
      })
    }
  }, (event) => {
    // [lordown.indent.modifier] + (← | →)
    return (event.keyCode === 37 || event.keyCode === 39) && event[config.indentModifier] &&
      // exactly one modifier key is pressed
      (event.ctrlKey + event.altKey + event.shiftKey === 1)
  })

  // Handle quote/unquote
  keyHandler.handle((event) => {
    const quote = event.keyCode === 39
    if (quote) {
      transformRegion(markdownMsg, /^/mg, () => {
        return {
          text: '>',
          delta: 1,
        }
      })
    } else {
      transformRegion(markdownMsg, /^(\s*>)/mg, (_match, quote) => {
        return {
          text: '',
          delta: -quote.length
        }
      })
    }
  }, (event) => {
    // Ctrl + Alt + (← | →)
    return (event.keyCode === 37 || event.keyCode === 39) &&
      event.altKey && event.ctrlKey
  })

  // Handle Alt+V (preview)
  keyHandler.handle(() => {
    convert()
    previewButton.click()
  }, (event) => {
    return event.altKey && event.keyCode == 86 // Alt+V
  })

  // We can't rely on the `submit` event since event listeners
  // are fired (at best) in the order they are attached to the element.
  handle(submit, 'click', convert)
}

const css = `
.lordown-button {
  cursor: pointer;
  margin-left: .5em;
  text-decoration: underline;
}

.lordown-button-disabled {
  text-decoration: line-through;
}
`

handle(window, 'load', () => {
  // Expose lordown state
  window.lordown = {
    config: config,
  }

  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = css
  document.documentElement.appendChild(style)

  init(choice('commentForm', 'messageForm'))
}, {
  log: false
})
