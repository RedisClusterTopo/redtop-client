$(document).ready(function () {
  var vpcIdBox = $('#vpcIdTextbox')
  var submitBtn = $('#submitBtn')

  // Collect textbox data and send to server on submit clicks
  submitBtn.click(function () {
    var vpc = {}
    vpc.id = vpcIdBox.val()

    // Store the AWS key/value pair in the browser cache
    window.localStorage.vpc = JSON.stringify(vpc)

    window.location.href = window.location.href + 'index'// Transfer client to index.html
  })
})
