## drawthe.net: Decent looking diagrams for engineers.

drawthe.net draws network diagrams dynamically from a text file describing the placement, layout and icons. Given a yaml file describing the hierarchy of the network and it's connections, a resulting diagram will be created.

![screenshot](https://github.com/cidrblock/drawthe.net/raw/master/screenshot_gc.png)

## Motivation

Complex network diagrams typically involve specific place of icons, connections and labels using a tool like Visio or OmniGraffle using a mouse and constantly zooming in and out for single pixel placement.  The goal behind drawthe.net, was to be able to describe the digram in a text file and have it rendered in SVG in the browser.  

I simply wanted to be able to draw network diagrams as fast as it could be done on a dry-erase board without using a mouse.

## Quick start

http://go.drawthe.net

Clear the editor and paste the following in, then click draw or ctrl-enter.

```yaml
diagram:
  fill: white
  rows: 5
  columns: 5
title:
  author: Your Name
  company: Comapny Name
  color: black
  logoFill: white
  logoUrl: https://upload.wikimedia.org/wikipedia/commons/b/b3/Wikipedia-logo-v2-en.svg
  text: Hello world
  subText: additional information about this diagram
  type: bar
  stroke: black
# Set defaults for icons, groups, connections
iconDefaults: &iconDefaults
  color: black
  fill: white
  stroke: black
  iconFamily: aws
groupDefaults: &groupDefaults
  fill: none
  color: black
  stroke: black
connectionDefaults: &connectionDefaults
  color: black
  stroke: black
noteDefaults: &noteDefaults
  color: black
  fill: white
  stroke: black
  xAlign: center
  yAlign: center
# Add the icons
icons:
  dns: {<<: *iconDefaults, icon: net_route53_hostedzone, x: 2, y: 3 }
  lb: {<<: *iconDefaults, icon: cmpt_elasticloadbalancing, y: "-1" }
  server1: {<<: *iconDefaults, icon: cmpt_ec2_instance, x: "-1", y: "-1" }
  server2: {<<: *iconDefaults, icon: cmpt_ec2_instance, x: "+1" }
  server3: {<<: *iconDefaults, icon: cmpt_ec2_instance, x: "+1" }
# Add the groups
groups:
  servers: { <<: *groupDefaults, name: Web Servers, members: [server1, server2, server3] }
# Add conneections
connections:
  - { <<: *connectionDefaults, endpoints: [dns, lb] }
  - { <<: *connectionDefaults, endpoints: [lb, servers] }
notes:
  note1:
    <<: *noteDefaults
    x: 0
    y: 3
    text: "##Note\n\nThis is the text for the note."
```

Hopefully, the following diagram is created.

![screenshot](https://github.com/cidrblock/drawthe.net/raw/master/quick_start.png)

## Overview

The YAML document has major sections which describe the diagram. These are the basic root types:

**diagram**: The page on which the diagram will be drawn.  
**title**: Information about the diagram.  
**icons**:  Objects to be placed on the diagram.  
**notes**: Text boxes with information.  
**connections**:  Lines drawn between objects.  
**groups**: Collections of objects.  

### Custom sections
The YAML document above has the following additional custom sections:

**iconDefaults**: A YAML anchor which describes common icon attributes which will be inherited later.  
**groupDefaults:** A YAML anchor which describes common group attributes which will be inherited later.  
**connectionDefaults:** A YAML anchor which describes common connection attributes which will be inherited later.  
**noteDefaults:** A YAML anchor which describes common note attributes which will be inherited later.  

YAML reference: https://en.wikipedia.org/wiki/YAML

### Placement

Icons and notes have the following attributes, which allows the object to be placed and sized on the place.

**x:** The X coordinate value.  
**y:** The Y coordinate value.  
**w:** The width of the object, in X coordinate steps, extending right toward the right side of the screen.  
**h:** The height of the object, in Y coordinate steps, extending down toward the bottom of the diagram.  

### Basic styling
Common to most entities are the following:

**color:** The color of the text.  
**fill:** Sets the color inside the object.  
**stroke:** Sets the color of the line drawn around the object.  

### Icons
The following icon families are available:
- aws
- azureCloud
- azureEnterprise
- cisco

Icons have the following basic attributes:

**iconFamily:** The family from which to pull the icon.  
**icon:** The name of the icon within the family.  
**iconFill:** Set the color inside the icon.  
**iconStroke:** Sets the color of the line drawn within the icon.  

Each icon and icon family may behave differently when the fill and stroke are applied, review the icon cut sheets to see the icons available for each family with the iconFill and iconStroke set.

### Notes

Notes can be plain text or markdown.  See the 'notes' example for the use of markdown.  (Indentation is critical when using markdown for notes.)

## Additional examples

http://go.drawthe.net

Click on the examples menu for a sample of different diagram layouts and styles.

### Troubleshooting

The most common mistake I've made is in the YAML syntax.  The developer tools window in chrome should give you an idea of what might be wrong.

It's also handy to comment out lines (with a #) to see where the issue may be.

## API Reference

### Diagram
`diagram`:
- `aspectRatio`: (defualt 1:1) The width:height ratio of the diagram.
- `columns`: (default: 10) The number of columns in the diagram.
- `fill`: (default: orange) The background color of the diagram.
- `gridLines:` (default: true)
  - `true`: Show the gridlines.
  - `false`: Hide the gridlines.
- `gridPaddingInner`: (default: .4) The ration of the icon box size to the spacing between the boxes.
- `groupPadding`: (default: .33) The percentage of the space between icons to use for the group boundary.
- `iconTextRatio`: (default: .33) The percentage of the icon box to allocate to the icon text.
- `margins`:
  - `top`: (default: 20) The top margin of the diagram in px.
  - `right`: (default: 20) The right side margin in px.
  - `bottom`: (default: 50) The bottom margin in px.
  - `left`: (default: 20) The left side margin in px.
  - Example: `margins: {top: 20, right: 20, bottom: 50, left: 20 }`
- `rows:` (default: 10) The number of rows.

### Title  
`title`:
- `author`: (default: "Bradley A. Thornton") The author of the diagram.
- `color`: (default: orange) The title text color.
- `company`: (default: Self) The company name.
- `date`: (default: `new Date().toLocaleDateString()`) The date for the diagram.
- `fill`: (default: orange) The title fill color.
- `heightPercentage`: (default: 6) The percentage of the diagram height to use for the title.
- `logoFill`: (default: orange) The color behind the logo.
- `logoUrl`: (default: `build/images/radial.png`) The URL for the logo.
- `stroke`: (default: orange) The line color for the title.
- `subText`: The title subtext.
- `text`: The title text.
- `type`: (default: box). The title type.
  - `box`: Draw a box around the title using the stroke color.
  - `bar`: Draw a line above the title using the stroke color.
  - Example: `type: bar`
- `version`: (default: 1.01) The version of the diagram.

### Icons

The icon's key will be used as the text value, therefore icon names have to be unique.

`icons`:
- `color`: (default: orange) The icon text color.
- `fill`: (default: orange) The fill color for the icon bounding box.
- `h`: (default: 1) The height of the icon.
- `icon`: (default: none) The name of the icon in the icon family.
- `iconFamily`: (default: none) The name of the icon family from which to get the icon.
- `iconFill`: (default: use the colors specified in the icon's svg file) The fill color for the icon.
- `iconStroke`: (default: use the colors specified in the icons's svg file) The color of the lines in the icon.
- `iconStrokeWidth`: (default: use the colors specified in the icons's svg file) The size of the lines within the icon.
- `metadata`: (default: none) A hash for the mouse over metadata (see the example)
  - `url`: If provided, with HTTP GET the metadata, expects a simple json object as a response.
  - Note:  The URL can contain {{ var }} for replacements, where var is the key or another attribute of the icon.
  - `errorText`: (default: HTTP status and text) Custom error message if HTTP GET fails.
- `preserveWhite`: (default: none) Don't change white in the source svg file. (this is useful for the cisco icon family)
- `stroke`: (default: orange) The color of the icon bounding box line.
- `strokeDashArray`: (default [0,0]) The stroke dash size in px and the spacing between the dashes in px.
- `text`: (default: none) Instead of the the icon's key use this text label for the icon label.
- `textLocation`: (default: bottomMiddle) The location of the text for the icon.
  - `bottomLeft`: Position the text along the bottom, in the left corner.
  - `bottomMiddle`: Position the text along the bottom, centered.
  - `bottomRight`: Position the text along the bottom, in the right corner.
  - `center`: Position the text in the center of the bounding box.
  - `leftBottom`: Position the text along the left side, in the bottom corner.
  - `leftMiddle`: Position the text along the left side, centered.
  - `leftTop`: Position the text along the left side, in the top corner.
  - `rightBottom`: Position the text along the right side, in the bottom corner.
  - `rightMiddle`: Position the text along the right side, centered.
  - `rightTop`: Position the text along the right side, in the top corner.
  - `topLeft`: Position the text along the top, in the left corner.
  - `topMiddle`: Position the text along the top, centered.
  - `topRight`: Position the text along the top, in the right corner.
  - Example: `textLocation: rightMiddle`
- `url`: (default: none) A link/URL for the icon text
- `w`: (default: 1) The width of the icon.
- `x`: (default: none) The x-coordinate location of the icon.
  - `n`: An absolute position.
  - `"+n"`: A value added from the previous icon's x value.
  - `"-n"`: A value subtracted from the previous icon's x value.
  - Example: `{x: "+5", y: 0}`
- `y`: (default: none) The y-coordinate location of the icon.
   - `n`: An absolute position.
   - `"+n"`: A value added from the previous icon's x value.
   - `"-n"`: A value subtracted from the previous icon's x value.
   - Example: `{x: 0, y: "+5"}`

### Groups

Groups are drawn in order, so place groups that should have a lower z-index at the top of the group array. A group is the smallest rectangle that includes it's members, so in the case of large groups, it will only be necessary to include the upper-left and lower-right most members.

`groups`:
- `color`: (default: orange) The group text color.
- `fill`: (default: orange) The fill color for the group.
- `members`: (default: none) An array of members for the group.
  - Note: A member can be another group or icon.
  - Example: ` inner: { <<: *group, stroke: none, fill: "white", textLocation: "rightMiddle", members: [T1, T4, NSG1] }`
- `name`:
- `stroke`: (default: orange) The color of the group's bounding box line.
- `strokeDashArray`: (default [0,0]) The stroke dash size in px and the spacing between the dashes in px.
- `textLocation`: (default: bottomMiddle) The location of the text for the icon.
  - `bottomLeft`: Position the text along the bottom, in the left corner.
  - `bottomMiddle`: Position the text along the bottom, centered.
  - `bottomRight`: Position the text along the bottom, in the right corner.
  - `center`: Position the text in the center of the bounding box.
  - `leftBottom`: Position the text along the left side, in the bottom corner.
  - `leftMiddle`: Position the text along the left side, centered.
  - `leftTop`: Position the text along the left side, in the top corner.
  - `rightBottom`: Position the text along the right side, in the bottom corner.
  - `rightMiddle`: Position the text along the right side, centered.
  - `rightTop`: Position the text along the right side, in the top corner.
  - `topLeft`: Position the text along the top, in the left corner.
  - `topMiddle`: Position the text along the top, centered.
  - `topRight`: Position the text along the top, in the right corner.
  - Example: `textLocation: rightMiddle`

### Connections

Connections are an array of individual connections. The order is insignificant because connections will always be drawn from left to right.

`connections`:

- `color`: (default: orange) The connection text color.
- `curve`: (default: curveLinear) The type of connection to draw.
  - `curveLinear`: Draws a line directly connecting the endpoints.
  - `curveStep`: Draws a line consisting of alternating horizontal and vertical lines. The y-value changes at the midpoint of each pair of adjacent x-values.
  - `curveStepAfter`: Draws a line consisting of alternating horizontal and vertical lines. The y-value changes after the x-value.
  - `curveStepBefore`: Draws a line consisting of alternating horizontal and vertical lines. The y-value changes before the x-value.
- `endpoints`: An array of 2 icons, groups or notes to draw connections between.
  - Note: When an endpoint is a group, lines will be drawn to each group member.
  - Example: `endpoints: [spines:40Gb,leaves:40Gb]`
  - Example: `endpoints: [allNTP:sync, allNTP:sync]`
- **labels:** Labels can be appended to the endpoint names and will be added to the line.
  Example: `endpoints: ["router:eth0", "firewall:eth1"]`
- `stroke`: (default: orange) The line color for the connection.
- `strokeDashArray`: (default [0,0]) The stroke dash size in px and the spacing

Curve definitions are directly from d3.js: https://github.com/d3/d3-shape (only a subset are implemented.)

### Notes

See the example call 'Notes' for examples of these attributes.

`notes`:

- `alignItems`: (default: flex-start) This defines the default behaviour for how flex items are laid out along the cross axis on the current line. Think of it as the justify-content version for the cross-axis (perpendicular to the main-axis).
  - `flex-start`: cross-start margin edge of the items is placed on the cross-start line
  - `flex-end`: cross-end margin edge of the items is placed on the cross-end line
  - `center`: items are centered in the cross-axis
  - `baseline`: items are aligned such as their baselines align
  - `stretch`: stretch to fill the container (still respect min-width/max-width)
- `color`: (default: orange) The note text color.
- `fill`: (default: orange) The fill color for the note bounding box.
- `flexDirection`: (defualt: column) The direction of the note.
  - `row`: left to right
  - `row-reverse`: right to left
  - `column`: stop to bottom
  - `column-reverse`: same as row-reverse but bottom to top
- `h`: (default: 1) The height of the note.
- `justifyContent`: (default: flex-start) This defines the alignment along the main axis.
  - `flex-start`: items are packed toward the start line
  - `flex-end`: items are packed toward to end line
  - `center`: items are centered along the line
  - `space-between`: items are evenly distributed in the line; first item is on the start line, last item on the end line
  - `space-around`: items are evenly distributed in the line with equal space around them. Note that visually the spaces aren't equal, since all the items have equal space on both sides. The first item will have one unit of space against the container edge, but two units of space between the next item because that next item has its own spacing that applies.
- `stroke`: (default: orange) The color of the note bounding box line.
- `strokeDashArray`: (default [0,0]) The stroke dash size in px and the spacing between the dashes in px.
- `text`: The text for the note, can be plain or markdown.
- `textAlign`: (default: left) The text-align property specifies the horizontal alignment of text in an element.
  - `left`:	Aligns the text to the left
  - `right`:	Aligns the text to the right
  - `center`:	Centers the text
  - `justify`:	Stretches the lines so that each line has equal width (like in newspapers and magazines)
- `w`: (default: 1) The width of the note.
- `x`: (default: none) The x-coordinate location of the note.
  - `n`: An absolute position.
  - `"+n"`: A value added from the previous note's x value.
  - `"-n"`: A value subtracted from the previous note's x value.
  - Example: `{x: "+5", y: 0}`
- `xAlign`: (default: left) Positions the text along the x axis.
  - `left`: Align the text to the left side of the note's bounding box.
    - Note: This sets `textAlign: "left", alignItems: "flex-start"`
  - `right`: Align the text to the right side of the note's bounding box.
    - Note: This sets `textAlign: "right", alignItems: "flex-end"`
  - `center`: Align the text in the middle of the note's bounding box along the x axis.
    - Note: This sets `textAlign: "center", alignItems: "center"`
- `y`: (default: none) The y-coordinate location of the note.
   - `n`: An absolute position.
   - `"+n"`: A value added from the previous note's x value.
   - `"-n"`: A value subtracted from the previous note's x value.
   - Example: `{x: 0, y: "+5"}`
- `yAlign`: (default: top) Positions the text along the y axis.
  - `top`: Align the text to the top of the note's bounding box.
    - Note: This sets `justifyContent: "flex-start"`
  - `bottom`: Align the text to the bottom side of the note's bounding box.
    - Note: This sets `justifyContent: "flex-end"`
  - `center`: Align the text in the middle of the note's bounding box along the y axis.
    - Note: This sets `justifyContent: "center"`



Each note is an html flexbox. For a good explanation of flex-boxes: https://css-tricks.com/snippets/css/a-guide-to-flexbox/  
Notes can also contain markdown converted by: Showdown.js https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax

## Built with great open source software

- **Ace editor:** https://ace.c9.io
- **Angular:** https://angularjs.org
- **D3.js:** https://d3js.org
- **js-yaml:** https://github.com/nodeca/js-yaml
- **Showdown:** https://github.com/showdownjs/showdown
- **Prettify:** https://github.com/google/code-prettify

## Contributing

Please do.

## Versioning

1.0 Initial release.

## Authors

* **Bradley Thornton** - *Initial work* - [cidrblock](https://github.com/cidrblock)

## License

This project is licensed under the MIT License. [MIT License](http://www.opensource.org/licenses/MIT).

------------------------

### Additional development information

#### Converting icons
1. copy the icons into a images/xxxx directory
2. clean up the names a little
3. convert from svg to eps and back to svg (this sizes the svg to the bounding window of the icon)
4. use svgo to cleaup the svg files

azure-cloud
```
cd build/images/azureCloud
cp ~/Downloads/Microsoft_CloudnEnterprise_Symbols_v2.5_PUBLIC/Symbols/CnE_Cloud/SVG/*.svg .
rename 's/[^a-zA-Z0-9_.]//g' *.svg
rename -f 'y/A-Z/a-z/' *.svg
rename 's/^Azure//g' *.svg
for i in `pwd`/*.svg; do inkscape $i -E ${i%.svg}.eps; done
rm *.svg
for i in `pwd`/*.eps; do inkscape $i -l ${i%.eps}.svg; done
rm *.eps
svgo .
cd .. && node ./build_list.js
```

AWS
```
mkdir aws && cd aws
find ~/Downloads/AWS_Simple_Icons_EPS-SVG_v16.2.22/ -type f -name \*.eps -exec cp \{\} . \;
for i in `pwd`/*.eps; do inkscape $i -l ${i%.eps}.svg; done
rm *.eps

rename 's/Amazon//g' *.svg
rename 's/AWS//g' *.svg
rename 's/^Analytics/anlt/g' *.svg
rename 's/^Application-Services/app/g' *.svg
rename 's/^Compute/cmpt/g' *.svg
rename 's/^Database/db/g' *.svg
rename 's/^Developer/dev/g' *.svg
rename 's/^Enterprise/ent/g' *.svg
rename 's/^General/gen/g' *.svg
rename 's/^Internet-Of-Things_IoT/iot_/g' *.svg
rename 's/^Management-Tools/mgmt/g' *.svg
rename 's/^Mobile-Services/mbl/g' *.svg
rename 's/^Networking/net/g' *.svg
rename 's/^On-Demand-Workforce_MechanicalTurk/odwmt/g' *.svg
rename 's/^Security-Identity/sec/g' *.svg
rename 's/^Storage-Content-Delivery/stor/g' *.svg
rename 's/[^a-zA-Z0-9_.]//g' *.svg
rename -f 'y/A-Z/a-z/' *.svg
svgo .
```
