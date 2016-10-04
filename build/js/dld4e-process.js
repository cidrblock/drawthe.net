var processEntities = function (svg, diagram, icons) {

  // set some defaults, even though these won't be used for iconss we'll set them anyway
  var defaults = {
    xAlign: "left",
    yAlign: "top",
    textLocation: "bottomMiddle"
  }

  var previous = {}
  for(var key in icons) {
    icons[key] = Object.assign({}, defaults, icons[key])
    icons[key].w = icons[key].w || 1
    icons[key].h = icons[key].h || 1
    if (!("x" in icons[key])) {
      icons[key].x = previous.x
    } else if (icons[key].x.toString().startsWith('+')) {
      icons[key].x = parseInt(previous.x) + parseInt(icons[key].x.toString().split('+')[1])
    } else if (icons[key].x.toString().startsWith('-')) {
      icons[key].x = parseInt(previous.x) - parseInt(icons[key].x.toString().split('-')[1])
    }
    icons[key].x1 = diagram.xBand(icons[key].x)
    if (!("y" in icons[key])) {
      icons[key].y = previous.y
    } else if (icons[key].y.toString().startsWith('+')) {
      icons[key].y = parseInt(previous.y) + parseInt(icons[key].y.toString().split('+')[1])
    } else if (icons[key].y.toString().startsWith('-')) {
      icons[key].y = parseInt(previous.y) - parseInt(icons[key].y.toString().split('-')[1])
    }
    icons[key].y1 = diagram.yBand(icons[key].y)
    icons[key].width = diagram.xBand.bandwidth() + ((icons[key].w - 1) * diagram.xBand.step())
    icons[key].height = diagram.yBand.bandwidth() + ((icons[key].h - 1) * diagram.yBand.step())
    icons[key].x2 = icons[key].x1 + icons[key].width
    icons[key].y2 = icons[key].y1 + icons[key].height
    icons[key].centerX = icons[key].x1 + icons[key].width/2
    icons[key].centerY = icons[key].y1 + icons[key].height/2
    icons[key].rx = diagram.xBand.bandwidth() * .05
    icons[key].ry = diagram.yBand.bandwidth() * .05
    icons[key].padding = Math.min(diagram.yBand.bandwidth() * .05, diagram.xBand.bandwidth() * .05)
    icons[key].iconPaddingX = parseFloat("5%")/100
    icons[key].iconPaddingY = parseFloat("5%")/100
    previous = icons[key]
  }
  return icons
}

function clone(hash) {
  var json = JSON.stringify(hash);
  var obj = JSON.parse(json);
  return obj;
}

function diveOne(entry, icons, groups, depth) {
  var answer = []
  if (entry in groups) {
    for (var i = 0; i < groups[entry].members.length; i++) {
      if (groups[entry].members[i] in groups) {
        result = diveOne(groups[entry].members[i], icons, groups, depth)
        answer = answer.concat(result.members)
        depth = result.depth
      } else {
        answer.push(groups[entry].members[i])
        if (i == 0 ) { depth += 1 }
      }
    }
  } else {
    answer.push(entry)
  }
  result = {members: answer, depth: depth}
  return result
}
function dive(connection, icons, groups) {
  var additionalConnections = []
  var endpoints = connection.endpoints.map( function(device) { return device.split(':')[0]})
  var labels = connection.endpoints.map( function(device) { return device.split(':')[1]})
  if (endpoints[0] in groups) {
    starters = diveOne( endpoints[0], icons, groups ).members
  } else {
    starters = [endpoints[0]]
  }
  if (endpoints[1] in groups) {
    enders = diveOne( endpoints[1], icons, groups ).members
  } else {
    enders = [endpoints[1]]
  }
  starters.forEach(function(starter) {
    enders.forEach(function(ender) {
      var c1 = starter + ":" + (labels[0] || '')
      var c2 = ender + ":" + (labels[1] || '')
      connection.endpoints = [c1,c2]
      additionalConnections.push(clone(connection))
    })
  })
  return additionalConnections
}
var processConnections = function(connections, groups, icons) {
  var additionalConnections = []
  for (var i = connections.length - 1; i >= 0; i--) {
    endpoints = connections[i].endpoints.map( function(device) { return device.split(':')[0]})
    labels = connections[i].endpoints.map( function(device) { return device.split(':')[1]})
    if ((endpoints[0] in groups) || (endpoints[1] in groups)) {
      additionalConnections = additionalConnections.concat(dive(connections[i],icons,groups))
      connections.splice(i, 1);
    } //if
  }
  return connections.concat(additionalConnections)
}

var processGroups = function(groups, diagram, icons) {
  for (var key in groups) {
    groups[key].maxDepth = 1
    var additionalMembers = []
    for (var i = groups[key].members.length - 1; i >= 0; i--) {
      if (!(groups[key].members[i] in icons)) {
        result = diveOne(groups[key].members[i], icons, groups, 1)
        additionalMembers = additionalMembers.concat(result.members)
        if (result.depth > groups[key].maxDepth) {
          groups[key].maxDepth = result.depth
        }
        groups[key].members.splice(i, 1);
      }
      groups[key].members = groups[key].members.concat(additionalMembers)
    }
    var xpad = (diagram.xBand.step() - diagram.xBand.bandwidth()) * diagram.groupPadding * groups[key].maxDepth
    var ypad = (diagram.yBand.step() - diagram.yBand.bandwidth()) * diagram.groupPadding * groups[key].maxDepth
    groups[key].x1 = diagram.xBand(d3.min(groups[key].members, function(d) {return icons[d].x })) - xpad
    groups[key].y1 = diagram.yBand(d3.max(groups[key].members, function(d) { return icons[d].y })) - ypad
    groups[key].x2 = d3.max(groups[key].members, function(d) { return icons[d].x2 + xpad })
    groups[key].y2 = d3.max(groups[key].members, function(d) { return icons[d].y2 + ypad })
    groups[key].width = groups[key].x2 - groups[key].x1
    groups[key].height = groups[key].y2 - groups[key].y1
    groups[key].fontSize = Math.min(xpad/groups[key].maxDepth,ypad/groups[key].maxDepth) - 2
  }
  return groups
}


function textPositions(x1, y1, x2, y2, fontSize) {
  var positions = {
    topLeft: { x: x1 + (fontSize/4), y: y1 + (fontSize/2), textAnchor: "start", rotate: 0 },
    topMiddle: { x: (x2 - x1)/2 + x1 , y: y1 + (fontSize/2), textAnchor: "middle", rotate: 0 },
    topRight: { x: x2 - (fontSize/4), y: y1 + (fontSize/2), textAnchor: "end", rotate: 0 },

    leftTop: { x: x1 + (fontSize/2), y: y1 + (fontSize/4), textAnchor: "end", rotate: -90 },
    leftMiddle: { x: x1 + (fontSize/2), y: y1 + (y2 - y1)/2, textAnchor: "middle", rotate: -90 },
    leftBottom: { x: x1 + (fontSize/2), y: y2 - (fontSize/4), textAnchor: "start", rotate: -90 },

    rightTop: { x: x2 - (fontSize/2), y: y1 + (fontSize/4), textAnchor: "start", rotate: 90 },
    rightMiddle: { x: x2 - (fontSize/2), y: y1 + (y2 - y1)/2, textAnchor: "middle", rotate: 90 },
    rightBottom: { x: x2 - (fontSize/2), y: y2 - (fontSize/4), textAnchor: "end", rotate: 90 },

    bottomLeft: { x: x1 + (fontSize/4), y: y2 - (fontSize/2), textAnchor: "start", rotate: 0 },
    bottomMiddle: { x: (x2 - x1)/2 + x1 , y: y2 - (fontSize/2), textAnchor: "middle", rotate: 0 },
    bottomRight: { x: x2 - (fontSize/4), y: y2 - (fontSize/2), textAnchor: "end", rotate: 0 },

    center: { x: (x2 - x1)/2 + x1 , y: y1 + (y2 - y1)/2 , textAnchor: "middle", rotate: 0 },
  }
  return positions
}




// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};
