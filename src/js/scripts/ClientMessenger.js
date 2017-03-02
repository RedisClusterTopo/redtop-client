var io = require('socket.io-client')

var MainView = require('./Graphics.js')
var ClusterGen = require('./ClusterGen.js')

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
    _this.socket.on('update', function (redtop) {
      console.log(redtop)
      _this.graphics.generate(redtop)
    })

    // Triggers generation of a random cluster to view graphics generation
    _this.socket.on('generate random', function () {
      _this.generator.generate(function (newCluster) {
        _this.graphics.generate(newCluster)
      })
    })

    _this.socket.on('local cluster', function () {
      _this.generator.generateLocal(function (topoData) {
        _this.graphics.generate(topoData) // Generate a single-instance topology
        // Subscribe the client to updates for the local cluster
        _this.socket.on('update-l', function (redisData) {
          console.log(redisData)
        })
      })
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

  console.log(messenger.clientID)

  messenger.socket.emit('subscribe', messenger.clientID)

  // Assume locally hosted cluster if no ID found
})
