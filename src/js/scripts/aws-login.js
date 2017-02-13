// Client socket used to communicate with the server
var io = require('socket.io-client')

// Define socket connection to server
var socket = io('http://localhost:8080')

socket.on('tag-response', function () {
  window.location.href = window.location.href + 'index'// Transfer client to index.html
})

$(document).ready(function () {
  var keyBox = $('#keyTextBox')
  var valBox = $('#valTextBox')
  var submitBtn = $('#submitBtn')

  // Collect textbox data and send to server on submit clicks
  submitBtn.click(function () {
    var tagData = {}

    tagData.key = keyBox.val()
    tagData.val = valBox.val()

    // Send key/val to server for aws query
    socket.emit('init-tag', tagData)

    // Store the AWS key/value pair in the browser cache
    window.localStorage.id = JSON.stringify({
      key: tagData.key,
      val: tagData.val
    })
  })
})
