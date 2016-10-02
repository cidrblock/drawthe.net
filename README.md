## DLD4E: Decent Looking Diagrams for Engineers

DLD4E draws network diagrams dynamically from a text file describing the placement, layout and icons. Given a yaml file describing the hierarchy of the network and it's connections, a resulting diagram will be created.

![screenshot](https://github.com/cidrblock/dld4e/raw/master/screenshot_gc.png)


## Motivation

Complex network diagrams typically involve specific place of icons, connections and labels using a tool like Visio or OmniGraffle using a mouse and constantly zooming in and out for single pixel placement.  The goal behind DLD4E, was to be able to describe the digram in a text file and have it rendered in SVG in the browser. In short, be able make network diagrams as fast as it could be done a dry erase board.  

## Quick start

http://dld4e.com

Clear the editor and paste the following in, then click draw or ctrl-enter.

```yaml
diagram:
  fill: "white"
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
  fill: "none"
  color: black
  stroke: black
connectionDefaults: &connectionDefaults
  color: "black"
  stroke: "black"
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
# Add the gorups
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

![screenshot](https://github.com/cidrblock/dld4e/raw/master/quick_start.png)

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

## Additional examples

http://dld4e.com

Click on the examples menu for a sample of different diagram layouts and styles.

## API Reference

flexDirection: (defualt: column)
  row: left to right in ltr; right to left in rtl
  row-reverse: right to left in ltr; left to right in rtl
-column: same as row but top to bottom
-column-reverse: same as row-reverse but bottom to top

## Tests

Describe and show how to run the tests with code examples.

## Built with these great libraries


## Contributors

Let people know how they can dive into the project, include important links to things like issue trackers, irc, twitter accounts if applicable.

## License

A short snippet describing the license (MIT, Apache, etc.)



### development
npm install
grunt


## Converting icons
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
