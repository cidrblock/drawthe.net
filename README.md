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
```

![screenshot](https://github.com/cidrblock/dld4e/raw/master/quick_start.png)

Show what the library does as concisely as possible, developers should be able to figure out **how** your project solves their problem by looking at the code example. Make sure the API you are showing off is obvious, and that your code is short and concise.

## Motivation

A short description of the motivation behind the creation and maintenance of the project. This should explain **why** the project exists.

## Installation

Provide code examples and explanations of how to get the project.

## API Reference

Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For medium size to larger projects it is important to at least provide a link to where the API reference docs live.

## Tests

Describe and show how to run the tests with code examples.

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
