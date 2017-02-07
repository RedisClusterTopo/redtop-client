var $ = window.$

var io = require('socket.io-client')

var MainView = require('./Graphics.js')
var ClusterGen = require('./ClusterGen.js')
var _parse = require('./ClusterObjectParser.js')

class ClientMessenger {
  constructor () {
    this.clientID = JSON.parse(window.localStorage.id)
    this.socket = io('http://localhost:8080')
    this.graphics = new MainView()
    this.generator = new ClusterGen()
    this._addListeners(this)
  }

  // Main control points for client behavior
  _addListeners (_this) {
    // Initial response from the server containing client data
    _this.socket.on('topo init', function (inTopo) {
      // Parse -> draw graphics for the initial data
      _parse(inTopo, function (parsedTopo) {
        _this.graphics.generate(parsedTopo) // Pass the parsed topology to graphics
      })

      // Update every 15s
      setInterval(function () {
        _this.socket.emit('update topo', _this.clientID)
      }, 15000)
    })

    // Triggers generation of a random cluster to view graphics generation
    _this.socket.on('topo init test', function () {
      _this.generator.generate(function (newCluster) {
        _this.graphics.generate(newCluster)
      })
    })

    // Triggered when the server sends an update with client data
    _this.socket.on('topo update', function (topoData) {
      _parse(topoData, _this.graohics.generate())
    })

    _this.socket.on('client not found', function () {
      window.alert('Client ID not found. Returning to tag entry page')
      window.location.href = 'http://localhost:8080'
    })

    _this.socket.on('err', function (e) {
      console.log(e)
    })
  }
}

$(document).ready(function () {
  var messenger = new ClientMessenger()

  // Update the server with what client id to init the app with
  messenger.socket.emit('init app', messenger.clientID)
})
