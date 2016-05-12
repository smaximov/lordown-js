const Lordown = require('../lib')
const lordown = new Lordown

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Testing_for_support_vs_availability
function storageAvailable(type) {
  try {
    const storage = window[type]
    const x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  }
  catch(e) {
    return false
  }
}

// Execute `localStorage.setItem('lordown.debug', 'true')` in the browser console
// to enable debug logging.
function debugEnabled() {
  return storageAvailable('localStorage') &&
    localStorage.getItem('lordown.debug') === 'true'
}

function debug(what, ...args) {
  if (debugEnabled()) {
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
    result.setAttribute(attr, updateAttr[attr])
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

function init(form) {
  if (form === null) {
    debug('init', 'comment form not found')
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
  lordownButton.appendTo(form.querySelector(`label[for=${msg.name}]`))

  const convert = () => {
    if (lordownButton.enabled) {
      const start = Date.now()
      msg.value = lordown.convert(markdownMsg.value)
      const end = Date.now()
      debug('convert',`${end - start} ms`)
    }
  }

  // Async previews use XHR instead of submit
  const previewButton = form.querySelector('button[type=button][name=preview]')
  if (previewButton !== null) {
    // Use `mousedown` instead of `click` since it's fired first
    handle(previewButton, 'mousedown', convert)
  }

  handle(markdownMsg, 'keydown', convert, {
    when(event) {
      return event.keyCode === 13 && event.ctrlKey
    }
  })

  handle(form, 'submit', convert)
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
