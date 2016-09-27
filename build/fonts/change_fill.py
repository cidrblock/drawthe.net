from lxml import etree

filename = 'cisco2/accesspoint.svg'
tree = etree.parse(open('cisco2/accesspoint.svg', 'rwb'))
for element in tree.iter():
    fill = element.get("fill")
    if fill and fill.lower() != 'none':
        del element.attrib["fill"]
    stroke = element.get("stroke")
    if stroke and stroke.lower() != 'none':
        del element.attrib["stroke"]
tree.write(filename)
