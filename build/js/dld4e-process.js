var processEntities = function (svg, drawing, objects) {

  // set some defaults, even though these won't be used for icons we'll set them anyway
  var defaults = {
    xAlign: "left",
    yAlign: "top",
    textLocation: "bottomMiddle"
    // w: 1,
    // h: 1
  }
  var previous = {}
  for(var key in objects) {
    objects[key] = Object.assign({}, defaults, objects[key])
    objects[key].w = objects[key].w || 1
    objects[key].h = objects[key].h || 1
    if (!("x" in objects[key])) {
      objects[key].x = previous.x
    } else if (objects[key].x.toString().startsWith('+')) {
      objects[key].x = parseInt(previous.x) + parseInt(objects[key].x.toString().split('+')[1])
    } else if (objects[key].x.toString().startsWith('-')) {
      objects[key].x = parseInt(previous.x) - parseInt(objects[key].x.toString().split('-')[1])
    }
    objects[key].x1 = diagram.xBand(objects[key].x)
    if (!("y" in objects[key])) {
      objects[key].y = previous.y
    } else if (objects[key].y.toString().startsWith('+')) {
      objects[key].y = parseInt(previous.y) + parseInt(objects[key].y.toString().split('+')[1])
    } else if (objects[key].y.toString().startsWith('-')) {
      objects[key].y = parseInt(previous.y) - parseInt(objects[key].y.toString().split('-')[1])
    }
    objects[key].y1 = diagram.yBand(objects[key].y)
    objects[key].width = diagram.xBand.bandwidth() + ((objects[key].w - 1) * diagram.xBand.step())
    objects[key].height = diagram.yBand.bandwidth() + ((objects[key].h - 1) * diagram.yBand.step())
    objects[key].x2 = objects[key].x1 + objects[key].width
    objects[key].y2 = objects[key].y1 + objects[key].height
    objects[key].centerX = objects[key].x1 + objects[key].width/2
    objects[key].centerY = objects[key].y1 + objects[key].height/2
    objects[key].rx = diagram.xBand.bandwidth() * .05
    objects[key].ry = diagram.yBand.bandwidth() * .05
    objects[key].padding = Math.min(diagram.yBand.bandwidth() * .05, diagram.xBand.bandwidth() * .05)
    objects[key].iconPaddingX = parseFloat("5%")/100
    objects[key].iconPaddingY = parseFloat("5%")/100
    previous = objects[key]
  }
  return objects
}

function clone(hash) {
  var json = JSON.stringify(hash);
  var object = JSON.parse(json);
  return object;
}

function diveOne(entry, objects, groups, depth) {
  var answer = []
  if (entry in groups) {
    for (var i = 0; i < groups[entry].members.length; i++) {
      if (groups[entry].members[i] in groups) {
        result = diveOne(groups[entry].members[i], objects, groups, depth)
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
function dive(connection, objects, groups) {
  var additionalConnections = []
  var endpoints = connection.endpoints.map( function(device) { return device.split(':')[0]})
  var labels = connection.endpoints.map( function(device) { return device.split(':')[1]})
  if (endpoints[0] in groups) {
    starters = diveOne( endpoints[0], objects, groups ).members
  } else {
    starters = [endpoints[0]]
  }
  if (endpoints[1] in groups) {
    enders = diveOne( endpoints[1], objects, groups ).members
  } else {
    enders = [endpoints[1]]
  }
  starters.forEach(function(starter) {
    enders.forEach(function(ender) {
      connection.endpoints = [`${starter}:${labels[0] || ''}`,`${ender}:${labels[1] || ''}`]
      additionalConnections.push(clone(connection))
    })
  })
  return additionalConnections
}
var processConnections = function(connections, groups, objects) {
  var additionalConnections = []
  for (var i = connections.length - 1; i >= 0; i--) {
    endpoints = connections[i].endpoints.map( function(device) { return device.split(':')[0]})
    labels = connections[i].endpoints.map( function(device) { return device.split(':')[1]})
    if ((endpoints[0] in groups) || (endpoints[1] in groups)) {
      additionalConnections = additionalConnections.concat(dive(connections[i],objects,groups))
      connections.splice(i, 1);
    } //if
  }
  return connections.concat(additionalConnections)
}

var processGroups = function(groups, objects) {
  for (var key in groups) {
    groups[key].maxDepth = 1
    var additionalMembers = []
    for (var i = groups[key].members.length - 1; i >= 0; i--) {
      if (!(groups[key].members[i] in objects)) {
        result = diveOne(groups[key].members[i], objects, groups, 1)
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
    groups[key].x1 = diagram.xBand(d3.min(groups[key].members, function(d) {return objects[d].x })) - xpad
    groups[key].y1 = diagram.yBand(d3.max(groups[key].members, function(d) { return objects[d].y })) - ypad
    groups[key].x2 = d3.max(groups[key].members, function(d) { return objects[d].x2 + xpad })
    groups[key].y2 = d3.max(groups[key].members, function(d) { return objects[d].y2 + ypad })
    groups[key].width = groups[key].x2 - groups[key].x1
    groups[key].height = groups[key].y2 - groups[key].y1
    groups[key].fontSize = Math.min(xpad/groups[key].maxDepth,ypad/groups[key].maxDepth) - 1
  }
  return groups
}


function textPositions(x1, y1, x2, y2) {
  var positions = {
    topLeft: { x: x1 + 1, y: y1 - 1, textAnchor: "start", rotate: 0, dominantBaseline: "text-before-edge"},
    topMiddle: { x: (x2 - x1)/2 + x1 , y: y1 - 1 , textAnchor: "middle", rotate: 0, dominantBaseline: "text-before-edge"},
    topRight: { x: x2 - 1, y: y1 - 1, textAnchor: "end", rotate: 0, dominantBaseline: "text-before-edge" },
    leftTop: { x: x1 - 1 , y: y1 + 1, textAnchor: "end", rotate: -90, dominantBaseline: "text-before-edge"},
    leftMiddle: { x: x1 - 1, y: y1 + (y2 - y1)/2, textAnchor: "middle", rotate: -90, dominantBaseline: "text-before-edge"},
    leftBottom: { x: x1 - 2, y: y2, textAnchor: "start", rotate: -90, dominantBaseline: "text-before-edge"},
    rightTop: { x: x2 + 1, y: y1 + 1, textAnchor: "start", rotate: 90, dominantBaseline: "text-before-edge"},
    rightMiddle: { x: x2 + 1, y: y1 + (y2 - y1)/2, textAnchor: "middle", rotate: 90, dominantBaseline: "text-before-edge"},
    rightBottom: { x: x2 + 1, y: y2 - 1, textAnchor: "end", rotate: 90, dominantBaseline: "text-before-edge"},
    bottomLeft: { x: x1 + 1, y: y2 - 1, textAnchor: "start", rotate: 0, dominantBaseline: "none"},
    bottomMiddle: { x: (x2 - x1)/2 + x1 , y: y2 - 1 , textAnchor: "middle", rotate: 0, dominantBaseline: "none"},
    bottomRight: { x: x2 - 1, y: y2 - 1, textAnchor: "end", rotate: 0, dominantBaseline: "none" },
    center: { x: (x2 - x1)/2 + x1 , y: y1 + (y2 - y1)/2 , textAnchor: "middle", rotate: 0, dominantBaseline: "central"},
    // remainders
  }
  // positions.topLeft.remainders = function() {
  //   return {
  //     x1: this.x,
  //     y2: this.y,
  //     x2:
  //   }
  // console.log(positions.topLeft.remainder())
  return positions
}
