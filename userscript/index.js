const Lordown = require('../lib')
const lordown = new Lordown

function handle(element, event, handler) {
  element.addEventListener(event, handler, false)
}

function choice(...ids) {
  for (let id of ids) {
    let result = document.getElementById(id)
    if (result !== null) return result
  }

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
  if (form === null) return

  const msg = choice('msg', 'form_msg')
  if (msg === null) return

  const markdownMsg = clone(msg, {
    id: 'lordown-msg',
    name: 'lordown-msg'
  })

  msg.parentNode.insertBefore(markdownMsg, msg)
  msg.style.display = 'none'

  // Button to toggle lordown on/off
  const lordownButton = new ToggleButton(true, 'Lordown', (enabled) => {
    setVisible(msg, !enabled)
    setVisible(markdownMsg, enabled)
  })
  lordownButton.appendTo(form.querySelector(`label[for=${msg.name}]`))

  const convert = () => {
    if (lordownButton.enabled) {
      msg.value = lordown.convert(markdownMsg.value)
    }
  }

  // Async previews use XHR instead of submit
  const previewButton = form.querySelector('button[type=button][name=preview]')
  if (previewButton !== null) {
    // Use `mousedown` instead of `click` since it's fired first
    handle(previewButton, 'mousedown', convert)
  }

  handle(markdownMsg, 'keydown', (event) => {
    if (event.keyCode === 13 && event.ctrlKey) {
      convert()
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
})
