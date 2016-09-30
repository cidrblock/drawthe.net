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
