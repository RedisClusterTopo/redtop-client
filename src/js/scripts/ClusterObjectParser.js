var RedTop = require('RedTop.js')
var AwsAvailabilityZone = require('AwsAvailabilityZone.js')
var AwsSubnet = require('AwsSubnet.js')
var Ec2Instance = require('Ec2Instance.js')
var ClusterNode = require('ClusterNode.js')

module.exports = function parse (topoData, done) {
  // console.log(topoData) //array of raw ec2 instance infos

  // Object to parse data into
  var t = new RedTop()

  topoData.forEach(function (inst, i) {
    var az = new AwsAvailabilityZone()
    az.setName(inst.Placement.AvailabilityZone)
    t.addAvailabilityZone(az)

    var sn = new AwsSubnet()
    sn.setNetID(inst.SubnetId)
    t.addSubnet(sn, az)

    var ec2inst = new Ec2Instance()
    ec2inst.setId(inst.InstanceId)
    ec2inst.setIp(inst.PrivateIpAddress)
    t.addInstance(ec2inst, sn, az)

    // TODO: Build and add node objects
    inst.Tags.forEach(function (ta) {
      if (ta.Key === 'master' || ta.Key === 'slave') {
        var n = new ClusterNode()
        n.setRole(ta.Key)
        n.setHost(ec2inst.getIp())
        n.setPort(ta.Value)
        t.addNode(n, ec2inst, sn, az)
      }
    })
  })

  done(t)
}
