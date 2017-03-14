var d3 = require('d3')
var leftInfoBar = require('./InfoBar.js')

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

    _this.focus = {
      node: null,
      replication: []
    }
  }

  generate (data) {
    var _this = this
    // Clear the html body
    $('p.topology').empty()

    reformat(data, function (d3Data) {
      _this.d3_nodes = d3.hierarchy(d3Data)

      _this.d3_nodes = _this.treemap(_this.d3_nodes)

      // The main SVG canvas
      _this.svg = d3.select('p.topology').append('svg')
      .attr('width', _this.width + _this.margin.left + _this.margin.right)
      .attr('height', _this.height + _this.margin.top + _this.margin.bottom)

      _this.g = _this.svg.append('g')
      .attr('transform', 'translate(' + _this.margin.left + ',' + _this.margin.top + ')')

      _this.addLinks()
      _this.addNodes()
      _this.addNodeShape()
      _this.addNodeText()
    })
  }

  addLinks () {
    var _this = this

    _this.links = _this.g.selectAll('.link')
    .data(_this.d3_nodes.descendants().slice(1))
    .enter().append('path')
    .attr('class', 'link')
    .attr('d', function (d) {
      // console.log(d)
      return 'M' + d.x + ',' + d.y +
      'C' + d.x + ',' + (d.y + d.parent.y) / 2 +
      ' ' + d.parent.x + ',' + (d.y + d.parent.y) / 2 +
      ' ' + d.parent.x + ',' + d.parent.y
    })
  }

  addNodes () {
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
      .on('click', function () { _this.selectNode(this, d3.select(this).datum().data) })
  }

  addNodeShape () {
    var _this = this

    _this.node._groups[0].forEach(function (n) {
      if (d3.select(n).datum().data.role === 'Master') {
        d3.select(n).append('rect')
        .attr('x', -10)
        .attr('y', -10)
        .attr('width', 20)
        .attr('height', 20)
      } else {
        d3.select(n).append('circle')
        .attr('r', 10)
      }
    })
  }

  addNodeText () {
    var _this = this

    _this.node.append('text')
    .attr('dy', '.4em')
    .attr('y', function (d) { return d.children ? -20 : 20 })
    .style('text-anchor', 'middle')
    .style('fill', 'grey')
    .text(function (d) { return d.data.name })
  }

  selectNode (node, nodeData) {
    // Don't select cluster root
    if (nodeData.name === 'Cluster root') return

    // Collapse sidebar and remove focus if node is already clicked
    if (this.focus.node === node) {
      $('#leftMenuBtn')[0].click()
      this._removeFocus()
      return
    }

    leftInfoBar(nodeData) // Display left side bar

    this._setFocus(node)  // Handle highlighting of selected node
  }

  // Input: the d3-formatted topology node clicked by the user
  // Changes the color of the selected node, as well as its associated master or slaves
  _setFocus (node) {
    var _this = this

    if (_this.focus.node !== node) {
      if (_this.focus.node != null) _this._removeFocus()
      _this.focus.node = node // Set the currently selected node
      _this.focus.node.childNodes[0].style.stroke = 'red' // Color the selected node

      if (d3.select(node).datum().data.type.toUpperCase() === 'CLUSTER NODE') {
        // For each associated master or slave,
        _this._findAssociatedNodes(node, function (associatedNodes) {
          associatedNodes.forEach(function (assocNode) {
            _this.focus.replication.push(assocNode)
            d3.select(assocNode)._groups[0][0].childNodes[0].style.stroke = 'orange'
          })
        })
      }
    } else if (_this.focus.node === node) {
      this._removeFocus()
    }
  }

  // Input: a master or slave node
  // Ouput: a slave's master or the set of a master's slaves, formatted to allow
  // d3 appending
  _findAssociatedNodes (selectedNode, done) {
    var associated = []
    var _this = this
    var nodeData = d3.select(selectedNode).datum().data

    var findMaster = nodeData.role.toUpperCase() === 'SLAVE' // Search for master if true
    var d3Data = _this.node._groups[0]

    d3Data.forEach(function (node) {
      var d = d3.select(node).datum().data
      if (d.type.toUpperCase() === 'CLUSTER NODE') {
        if (findMaster) {
          if (d.role.toUpperCase() === 'MASTER') {
            if (d.id === nodeData.replicates && d.id === nodeData.replicates) {
              associated.push(node)
            }
          }
        } else {
          if (d.role.toUpperCase() === 'SLAVE' && !findMaster) {
            nodeData.slaves.forEach(function (slave) {
              if (slave === d.id && slave === d.id) {
                //console.log(node)
                associated.push(node)
              }
            })
          }
        }
      }
    })

    done(associated)
  }

  _removeFocus () {
    this.focus.node.childNodes[0].style.stroke = 'steelblue'
    this.focus.replication.forEach(function (assocNode) {
      d3.select(assocNode)._groups[0][0].childNodes[0].style.stroke = 'steelblue'
    })

    this.focus = {node: null, replication: []}
  }
}

// transform data into acceptable object format for d3
function reformat (data, callback) {
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
