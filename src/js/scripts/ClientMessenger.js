var io = require('socket.io-client')
var MainView = require('./Graphics.js')
var ClusterGen = require('./ClusterGen.js')

class ClientMessenger {
  constructor () {
    this.vpcId = $.parseJSON(window.localStorage.vpc).id
    this.socket = io(window.location.origin)
    this.graphics = new MainView()
    this.generator = new ClusterGen()
    this._addListeners(this)
  }

  // Main control points for client behavior
  _addListeners (_this) {
    _this.socket.on('update', function (clusterState) {
      _this.graphics.generate(clusterState)
    })

    // Triggers generation of a random cluster to view graphics generation
    _this.socket.on('generate random', function () {
      _this.generator.generate(function (newCluster) {
        _this.graphics.generate(newCluster)
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

  messenger.socket.emit('subscribe', messenger.vpcId)
})
