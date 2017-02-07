// Min/max possible children to add at each possible node during generation
var min = 1
var max = 4

var RedTop = require('RedTop.js')
var AwsAvailabilityZone = require('AwsAvailabilityZone.js')
var AwsSubnet = require('AwsSubnet.js')
var Ec2Instance = require('Ec2Instance.js')
var ClusterNode = require('ClusterNode.js')

module.exports = class ClusterGen {
  generate (cb) {
    var r = new RedTop()
    var _this = this

    var i
    for (i = 0; i < randomNum(min, max); i++) {
      var newAZ = _this.genAZ()
      r.addAvailabilityZone(newAZ)
    }

    r.getAvailabilityZones().forEach(function (az) {
      for (var i = 0; i < randomNum(min, max); i++) {
        var newSubnet = _this.genSubnet(az)

        for (var j = 0; j < randomNum(min, max); j++) {
          var newInst = _this.genInstance(newSubnet, az)

          for (var k = 0; k < randomNum(min, max); k++) {
            var newNode = _this.genNode(newInst, newSubnet, az)
            newInst.addNode(newNode)
          }
          newSubnet.addInstance(newInst)
        }
        az.addSubnet(newSubnet)
      }

      r.addAvailabilityZone(az)
    })

    this.fixReplication(r, function (r) {
      _this.fixHash(r, function (r) {

      })
    })

    cb(r)
  }

  fixHash (r, cb) {
    // Assign each master node an equal share of the hash values
    var rangeMax = 16384
    var increment = Math.round(rangeMax / r.getNodes().length)
    var curHash = 0

    r.getMasters().forEach(function (node) {
      var range = {}
      range.lower = curHash
      range.upper = curHash + increment

      curHash += increment
      if (curHash > 16384) curHash = 16384

      node.addHash(range)
    })

    r.getSlaves().forEach(function (node) {
      node.hash = node.replicates.hash
    })

    cb(r)
  }

  fixReplication (r, cb) {
    var masters = r.getMasters()
    var l = masters.length

    r.getSlaves().forEach(function (node) {
      if (node) {
        var randomMaster = masters[randomNum(0, l - 1)]
        node.setReplicates(randomMaster)
        randomMaster.addSlave(node)
      }
    })

    cb(r)
  }

  genAZ () {
    var az = new AwsAvailabilityZone()

    az.setName(randomID())

    return az
  }

  genSubnet () {
    var s = new AwsSubnet()

    s.setNetID(randomID())

    return s
  }

  genInstance () {
    var inst = new Ec2Instance()

    inst.setId(randomID())
    inst.setIp(randomIP())

    return inst
  }

  genNode (inst) {
    var n = new ClusterNode()

    n.setHost(inst.getIp())
    n.setPort(randomNum(7000, 12000))

    if (Math.random() > 0.75) n.setRole('Master')
    else n.setRole('Slave')

    return n
  }
}

function randomIP () {
  var ip = ''

  for (var i = 0; i < 4; i++) {
    ip += randomNum(1, 255).toString()
    if (i < 3) ip += '.'
  }

  return ip
}

function randomNum (min, max) {
  return Math.round(Math.random() * (max - min) + min)
}

function randomID () {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10)
}
