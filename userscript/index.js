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

function indentRegion(textarea, indent) {
  const region = extendedRegion(textarea)
  debug(indent ? 'indent' : 'unindent',
        `region [${region.start}, ${region.end}]:\n${util.truncate(region.text, 20)}`)

  let replacement
  let offset = null
  let delta = 0

  if (indent) {
    replacement = region.text.replace(/^/mg, () => {
      if (offset === null) offset = 4
      delta += 4
      return '    '
    })
  } else {
    replacement = region.text.replace(/^( {0,4})/mg, (_match, spaces) => {
      const length = spaces.length

      if (offset === null) offset = length

      delta += length
      return ''
    })
  }

  const deltaStart = (indent ? 1 : -1) * (offset || 0)
  const deltaEnd = (indent ? 1 : -1) * delta

  const start = textarea.selectionStart + deltaStart
  const end = textarea.selectionEnd + deltaEnd

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

  handle(markdownMsg, 'keydown', () => {
    // Cloning an element discards its event listeners,
    // so we are going to trigger `submit` manually via `click`.
    submit.click()
  }, {
    when(event) {
      // Ctrl + Enter
      return event.keyCode === 13 && event.ctrlKey
    }
  })

  // Disable default action bound to Ctrl + (← | →)
  handle(markdownMsg, 'keydown', (event) => {
    event.preventDefault()
  }, {
    when(event) {
      // Ctrl + (← | →)
      return (event.keyCode === 37 || event.keyCode === 39) && event.ctrlKey
    }
  })

  handle(markdownMsg, 'keyup', (event) => {
    const indent = event.keyCode === 39
    indentRegion(markdownMsg, indent)
  }, {
    when(event) {
      // Ctrl + (← | →)
      return (event.keyCode === 37 || event.keyCode === 39) && event.ctrlKey
    }
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
  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = css
  document.documentElement.appendChild(style)

  init(choice('commentForm', 'messageForm'))
}, {
  log: false
})
