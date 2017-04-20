var d3 = require('d3')
module.exports = function leftInfoBar (data) {
  var side = $('#sidebar-wrapper')

  side.empty()

  console.log(data)
  // Side bar is hidden if true
  if ($('#wrapper').hasClass('leftMenuOff')) $('#wrapper').toggleClass('leftMenuOff')

  // Set the sidebar header
  var header = $('<h2></h2>')
  header.text(data.name)
  side.append(header)

  var infoTable = $('<table></table>') // Holds entries to the side panel

  // Iterate through node data and create table entry for relevant attributes
  $.each(data, function (k, v) {
    if (k === 'children') return
    var row = $('<tr></tr>')

    if (k === 'replicates' && data.role.toUpperCase() === 'SLAVE') {
    }

    // Create a dropdown containing all the hash ranges selected node is associated with
    if (k === 'hash' && v.length !== 0) {
      var hashList = $('<select> </select>')

      v.forEach(function (range) {
        var listEntry = $('<option>' + range.lower.toString() + ' - ' + range.upper.toString() + ' </option>')
        hashList.append(listEntry)
      })

      var td = $('<td id=\'hashRow\'>' + k + ': ' + '</td>')
      td.append(hashList)
      row.append(td)
    } else if (k === 'slaves' && data.role.toUpperCase() === 'MASTER') {
      // Append the drop down of associated slave nodes for a master
      var slavesList = $('<select></select>')

      $.each(v, function (index, repNode) {
        var listEntry = $('<option>' + "ID " + ' : ' + v + '</option>')

        slavesList.append(listEntry)
      })

      row.append('<td>' + k + ':' + '</td>')

      row.append(slavesList)
    } else if (k === 'replicates' && data.role.toUpperCase() === 'SLAVE') {
      if (v != null) {
        // Append a dropdown with only the master of a selected slave
        var master = $('<select> </select>')
        var node = $('<option>' + "ID " + ' : ' + v + '</option>')
        master.append(node)
        var td = $('<td>' + k + ':' + '</td>')
        td.append(master)
        row.append(td)
      }
    } else if (k === 'replicates' && data.role.toUpperCase() === 'MASTER') {
      // Don't append the replicates field for master (should always be empty)
    } else if (k === 'slaves' && data.role.toUpperCase() === 'SLAVE') {
      // Don't append the slaves field for slaves (should always be empty)
    } else {
      // Append text for other info
      row.append($('<td>' + k + ': ' + v + '</td>'))
    }

    infoTable.append(row)
  })

  side.append(infoTable)

  // Button/link for closing the side bar
  side.append($('<div style=\'text-align:center\' id=\'btnContainer\'>'))
  $('#btnContainer').append($('<input type=\'button\' id=\'leftMenuBtn\' value=\'Close\'/>'))
  side.append($('<a href=\'#leftMenuToggle\' class=\'btn btn-default\' id=\'leftMenuToggle\' hidden>Toggle Menu</a>'))

  $('#leftMenuBtn').click(function (e) {
    $('#leftMenuToggle').click()
    e.preventDefault()
    $('#wrapper').toggleClass('leftMenuOff')
    // removeFocus()
  })

  function buildSplitBrainInfo(sbData, cb)
  {
    if(sbData != null)
    {
      var sbRow = $('<tr></tr>')
      var  sbv= $('<td>' + 'Split Brain View' + '</td>')
      var i =0, j=0 ,k=0
      //sbRow.append(sbv)
      if (typeof sbData.ffList !== 'undefined' && sbData.ffList.length > 0)
      {
        //var td = $('<td>' + 'Fail' + ':' + '</td>')
        var ffList = $('<select> </select>')
        sbData.ffList.forEach(function(ff)
        {
          var ff =  $('<option>' + "Fail " + ' : ' +ff.toString() + '</option>')
          ffList.append(ff)

        })
          sbv.append(ffList)
          sbRow.append(sbv)
          //console.log("done fail" + td)

      }
      if (typeof sbData.pfList !== 'undefined' && sbData.pfList.length > 0)
      {
        //var td = $('<td>' + 'pFail' + ':' + '</td>')
        var pfList = $('<select> </select>')
        sbData.pfList.forEach(function(pf)
        {
          var pff =  $('<option>' + "pFail " + ' : ' +pf.toString() + '</option>')
          pfList.append(pff)
        })
          sbv.append(pfList)
          sbRow.append(sbv)
          //console.log("done pfail" + td)

      }
      if (typeof sbData.fineList !== 'undefined' && sbData.fineList.length > 0)
      {
        //var td = $('<td>' +'Fine' + ':' + '</td>')
        var fList = $('<select> </select>')
        sbData.fineList.forEach(function(fff){
          var f =  $('<option>' + "Fine " + ' : ' +fff.toString() + '</option>')
          fList.append(f)
        })
          sbv.append(fList)
          sbRow.append(sbv)
          //console.log("done fine" + td)

      }
        console.log(sbRow)
        cb(sbRow)
    }
  }

}
