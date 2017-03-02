$(document).ready(function () {
  var keyBox = $('#keyTextBox')
  var valBox = $('#valTextBox')
  var submitBtn = $('#submitBtn')

  // Collect textbox data and send to server on submit clicks
  submitBtn.click(function () {
    var tagData = {}

    tagData.key = keyBox.val()
    tagData.val = valBox.val()

    // Store the AWS key/value pair in the browser cache
    window.localStorage.id = JSON.stringify({
      key: tagData.key,
      val: tagData.val
    })

    window.location.href = window.location.href + 'index'// Transfer client to index.html
  })
})
