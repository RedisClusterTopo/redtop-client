var d3 = require('d3')
var leftInfoBar = require('./InfoBar.js')

// SVG path components of icons
var cloud = [
  {
    d: 'M94.405,53.529c-0.716-2.649-2.065-5.077-3.914-7.13c-3.388-3.039-8.02-4.254-10.452-4.694  c-0.445-0.096-0.897-0.162-1.354-0.206c-0.117-0.014-0.204-0.022-0.246-0.027c-0.025-0.001-0.037-0.003-0.037-0.003  c-0.201-0.531-0.391-1.067-0.587-1.599c-0.428-1.161-0.885-2.301-1.544-3.311c-0.228-0.349-0.48-0.683-0.764-0.997  c-2.5-3.195-6.291-4.973-10.132-5.524c-1.512-0.216-2.474-0.251-3.713-0.089c-0.263,0.034-0.534,0.074-0.829,0.126  c-1.387,0.242-2.665,0.935-3.98,1.319c-0.658-0.347-1.118-0.939-1.678-1.459c-0.093-0.09-0.19-0.172-0.283-0.259  c-2.713-2.542-6.006-4.428-9.585-5.092c-3.377-0.626-4.098-0.938-9.541,0c-0.286,0.049-0.57,0.116-0.855,0.181  c-6.253,0.936-11.275,5.16-12.809,10.631c-0.282,0.639-0.539,1.295-0.745,1.972c-0.528,1.355-2.106,1.286-3.224,1.702  c-0.262,0.091-0.518,0.196-0.776,0.3c-5.391,2.155-9.851,6.98-11.409,12.926c-0.344,0.981-0.597,1.996-0.755,3.036  C5.068,56.15,5,56.983,5,57.828c0,7.132,4.587,13.316,11.241,16.291c2.698,1.207,5.734,1.889,8.945,1.889h49.628  c3.594,0,6.965-0.86,9.889-2.349c2.277-1.158,4.278-2.701,5.897-4.534c2.746-3.106,4.4-7.028,4.4-11.297  C95,56.345,94.779,54.91,94.405,53.529z'
  }
]

var router = [
  {
    d: 'M94.522,27.561c0-1.303-0.58-2.69-1.883-2.69c-1.303,0-1.883,1.386-1.883,2.69l-0.393,30.087h-3.083V52.57  c0-3.047-2.47-5.515-5.516-5.515H10.516C7.469,47.055,5,49.524,5,52.57v14.478c0,3.048,2.469,5.517,5.516,5.517h0.685  c0,1.304,1.057,2.36,2.361,2.36h5.394c1.304,0,2.361-1.056,2.361-2.36h50.244c0,1.304,1.057,2.361,2.361,2.361h5.395  c1.304,0,2.361-1.058,2.361-2.361h0.085c3.046,0,5.516-2.469,5.516-5.517v-2.596h3.037c0.18,1.125,1.148,1.986,2.323,1.986  c1.303,0,2.361-1.057,2.361-2.361L94.522,27.561z'
  }
]

var computer = [
  {
    d: 'M95.584,10.274H4.416c-1.656,0-3,1.343-3,3v57.167c0,1.656,1.344,3,3,3h37.815c-0.251,3.818-1.378,10.443-6.163,10.916  c-0.118,0.012-0.209,0.023-0.288,0.035h-0.571c-1.473,0-2.668,1.193-2.668,2.666s1.195,2.668,2.668,2.668h29.582  c1.473,0,2.668-1.195,2.668-2.668s-1.195-2.666-2.668-2.666H64.22c-0.079-0.012-0.17-0.023-0.288-0.035  c-4.785-0.473-5.912-7.098-6.163-10.916h37.815c1.656,0,3-1.344,3-3V13.274C98.584,11.617,97.24,10.274,95.584,10.274z'
  }
]

module.exports = class Graphics {
  constructor () {
    var _this = this

    _this.d3_nodes = null
    _this.links = null

    _this.margin = {top: 40, right: 90, bottom: 50, left: 90}

    _this.width = window.innerWidth - _this.margin.left - _this.margin.right - (window.innerWidth / 12)

    _this.height = window.innerHeight - _this.margin.top - _this.margin.bottom - (window.innerWidth / 12)

    _this.treemap = d3.tree()
    .size([_this.width, _this.height - 100])

    _this.x_scale = d3.scaleLinear()
    .domain([-1, _this.width + 1])
    .range([-1, _this.width + 1])

    _this.y_scale = d3.scaleLinear()
    .domain([-1, _this.height - 100])
    .range([-1, _this.height - 100])

    _this.state = {
      focus: {  // Currently selected node (clicked on)
        node: null, // The node id
        replication: [] // Collection of slave IDs if master is selected, otherwise the selected node's master
      },
      flashing: []  // Node IDs of any flashing node
    }
  }

  // Orchestrate function calls for redrawing the topology when receiving an update
  generate (clusterState) {
    var _this = this

    $('p.topology').empty() // Clear the html body

    _this._reformat(clusterState.redtop, function (d3redtop) {
      _this.d3_nodes = d3.hierarchy(d3redtop)
      _this.d3_nodes = _this.treemap(_this.d3_nodes)

      // The main SVG canvas
      _this.svg = d3.select('p.topology').append('svg')
      .attr('width', _this.width + _this.margin.left + _this.margin.right)
      .attr('height', _this.height + _this.margin.top + _this.margin.bottom)

      _this.g = _this.svg.append('g')
      .attr('transform', 'translate(' + _this.margin.left + ',' + _this.margin.top + ')')

      // Draw to the svg canvas
      _this.addLinks()
      _this.addNodes(clusterState)
      _this.addNodeShape()
      _this.addNodeText()
      // _this.displayStateErrors(clusterState.stateErrors)
			//_this.displaySplitBrainResults(clusterState.sbContainer, clusterState.sb)
      if (_this.state.focus.node != null) {
        _this._setFocus(_this.state.focus.node) // Recolor previously selected nodes
      }
    })
  }

  displaySplitBrainResults(sbContainer, sb)
  {
    var _this = this
    if(sb)
    {
        sbContainer.forEach(function(sbNode)
        {
          _this._selectD3NodeById(sbNode.splitNode, function (g, nodeData) {
                g.style.stroke = '#ffffff'
                g.style.strokeDasharray = 6
          })
        })
    }
  }

  displayStateErrors (stateErrors) {
    var _this = this

    stateErrors.noExternalReplication.forEach(function (node) {
      _this._selectD3NodeById(node, function (g, nodeData) {
        g.style.stroke = '#ff0000'
        g.style.fill = '#ff8080'

        setTimeout(function () {
          g.style.stroke = 'black'
        }, 1000)

        setTimeout(function () {
            g.style.stroke = '#ff0000'
            g.style.fill = '#ff8080'
        }, 2000)

        setTimeout(function () {
          g.style.stroke = 'black'
        }, 3000)

        setTimeout(function () {
            g.style.stroke = '#ff0000'
            g.style.fill = '#ff8080'
        }, 4000)

        setTimeout(function () {
          g.style.stroke = 'black'
        }, 5000)
      })
    })
  }

  addLinks () {
    var _this = this
    _this.links = _this.g.selectAll('.link')
    .data(_this.d3_nodes.descendants().slice(1))
    .enter().append('path')
    .attr('class', 'link')
    .attr('d', function (d) {
      return 'M' + d.x + ',' + d.y +
      'C' + d.x + ',' + (d.y + d.parent.y) / 2 +
      ' ' + d.parent.x + ',' + (d.y + d.parent.y) / 2 +
      ' ' + d.parent.x + ',' + d.parent.y
    })
  }

  addNodes (clusterState) {
    var _this = this

    _this.node = _this.g.selectAll('.node')
    .data(_this.d3_nodes.descendants())
    .enter().append('g')
    .attr('class', function (d) {
      return 'node' +
      (d.children ? ' node--internal' : ' node--leaf')
    })
    .attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')'
    })
      .on('click', function () { _this.selectNode(this, d3.select(this).datum().data, clusterState) })
  }

  // Append a graphics object for each node
  addNodeShape () {
    var _this = this

    // For each node in the topology add the corresponding icon according to node's type
    _this.node._groups[0].forEach(function (n) {
      switch (d3.select(n).datum().data.type) {

        case 'Availability Zone':
          d3.select(n).append('g')
            .attr('transform', 'scale(.5, .5) translate(-45, -20)')
            .style('stroke', '#6b6b47')
            .style('fill', '#999966')
            .style('stroke-width', '6px')
            .selectAll('path')
            .data(cloud)
            .enter()
            .append('path')
            .attr('d', function (d) { return d.d })
          break

        case 'Subnet':
          d3.select(n).append('g')
            .attr('transform', 'scale(.6, .6) translate(-45,-32)')
            .style('stroke', '#6b6b47')
            .style('fill', '#999966')
            .style('stroke-width', '4px')
            .selectAll('path')
            .data(router)
            .enter()
            .append('path')
            .attr('d', function (d) { return d.d })
          break

        case 'EC2 Instance':
          d3.select(n).append('g')
            .attr('transform', 'scale(.5, .5) translate(-50, -15)')
            .style('stroke', '#6b6b47')
            .style('fill', '#999966')
            .style('stroke-width', '6px')
            .selectAll('path')
            .data(computer)
            .enter()
            .append('path')
            .attr('d', function (d) { return d.d })
          break

        case 'Cluster Node':
          if (d3.select(n).datum().data.role === 'Master') {
            d3.select(n).append('rect')
              .attr('x', -10)
              .attr('y', -10)
              .style('stroke', '#1aff66')
              .style('fill', '#00802b')
              .attr('width', 25)
              .attr('height', 25)
          } else if (d3.select(n).datum().data.role === 'Slave') {
            d3.select(n).append('circle')
              .attr('r', 15)
              .style('stroke', '#1aff66')
              .style('fill', '#00802b')
          }
          break
        default:
          break
      }
    })
  }

  // Append text to d3 nodes using the "name" field of its associated data
  addNodeText () {
    var _this = this

    _this.node.append('text')
    .attr('dy', '.8em')
    .attr('y', function (d) { return d.children ? -20 : 20 })
    .style('text-anchor', 'middle')
    .style('fill', 'white')
    .text(function (d) { return d.data.name })
  }

  // Triggered when clicking a topology node
  // TOGGLES sidebar expansion and coloring of focused nodes
  selectNode (node, nodeData, clusterState) {
    // Don't select cluster root
    if (nodeData.name === 'Cluster Root') return
    console.log(nodeData)
    var same = false // Determines whether the clicked node is already selected
    var splitNodeInfo = null
    this._removeFocus() // Always remove colors from previously focused node(s)

    // Check if the node is already selected
    // TODO: Change the ID fields of redtop components to be the same (some use x.id while others use x.name)
    if (nodeData.type.toUpperCase() === 'CLUSTER NODE') {
      if (this.state.focus.node === nodeData.id) {
        same = true
      } else {
        this.state.focus.node = nodeData.id
      }
    } else {
      if (this.state.focus.node === nodeData.name) {
        same = true
      } else {
        this.state.focus.node = nodeData.name
      }
    }
    console.log("do we have a splitbrain up in hur" +clusterState.sb)
    if(clusterState.sb)
    {
        clusterState.sbContainer.forEach(function(sNode)
        {
          console.log("checking if this is a split node" + nodeData.id +"==" +sNode.splitNode)
          if(nodeData.id == sNode.splitNode)
          {
            splitNodeInfo = sNode
          }
        })
    }
    leftInfoBar(nodeData, splitNodeInfo) // Display left side bar
    this._setFocus(this.state.focus.node)  // Handle highlighting of selected node

    if (same) {
      $('#leftMenuBtn')[0].click() // remove the left side bar
      this._removeFocus() // remove color from selected nodes
      this.state.focus = {node: null, replication: []}  // prevent previously focused nodes from remaining focused next update
    }
  }

  // Input: the ID of the selected node
  // Changes the color of the selected node, as well as its associated master or slaves
  _setFocus (node) {
    var _this = this

    _this._selectD3NodeById(node, function (g, nodeData) {
      g.style.stroke = 'red'

      // Change color of associated nodes to orange
      if (nodeData.replicates) {
        if (typeof (nodeData.replicates) === 'string') {
          _this._selectD3NodeById(nodeData.replicates, function (g, nodeData) {
            _this.state.focus.replication.push(nodeData.replicates)
            g.style.stroke = 'orange'
          })
        }
      } else if (nodeData.slaves) {
        nodeData.slaves.forEach(function (replicationId) {
          _this.state.focus.replication.push(replicationId)
          _this._selectD3NodeById(replicationId, function (g, nodeData) {
            g.style.stroke = 'orange'
          })
        })
      }
    })
  }

  // Remove color from nodes currently stored in this.state.focus
  _removeFocus () {
    var _this = this

    // Revert main node
    // TODO handle selecting nodes vs the rest of the cluster

    this._selectD3NodeById(_this.state.focus.node, function (g) {
      g.style.stroke = 'steelblue'
    })

    // Revert associated nodes if present
    if (this.state.focus.replication.length > 0) {
      this.state.focus.replication.forEach(function (assocNode) {
        _this._selectD3NodeById(assocNode, function (g) {
          g.style.stroke = 'steelblue'
        })
      })
    }
  }

  // Input: a redis cluster node ID or the name of some non-leaf node
  // Returns: the graphics object associated with the given ID and the nodes' corresponding
  //    data object
  _selectD3NodeById (nodeId, cb) {
    this.node._groups[0].forEach(function (g) {
      var n = d3.select(g)

      if (n.datum().data.id === nodeId) {
        cb(n._groups[0][0].firstChild, n.datum().data)
      } else if (n.datum().data.name === nodeId) {
        cb(n._groups[0][0].firstChild.firstChild, n.datum().data)
      }
    })
  }

  // Transform server data payload into acceptable object format for d3
  _reformat (data, callback) {
    data.name = 'Cluster root'

    data.children = data.zones
    delete data.zones

    data.children.forEach(function (z) {
      z.children = z.subnets
      delete z.subnets
      z.children.forEach(function (net) {
        net.name = net.netid
        delete net.netid

        net.children = net.instances
        delete net.instances

        net.children.forEach(function (inst) {
          inst.name = inst.id
          delete inst.id
          inst.children = inst.nodes
          delete inst.nodes

          inst.children.forEach(function (n) {
            n.name = n.port
            n.children = null
          })
        })
      })
    })

    callback(data)
  }
}
