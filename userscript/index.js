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

  const convert = () => {
    msg.value = lordown.convert(markdownMsg.value)
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

handle(window, 'load', () => {
  init(choice('commentForm', 'messageForm'))
})
