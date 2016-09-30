### development
npm install
grunt


## Converting icons
1. copy the icons into a images/xxxx directory
2. clean up the names a little
3. convert from svg to eps and back to svg (this sizes the svg to the bounding window of the icon)
3. use svgo to cleaup the svg files
4.

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
find ~/Downloads/AWS_Simple_Icons_EPS-SVG_v16.2.22/ -type f -name \*.svg -exec cp \{\} . \;
rename 's/Amazon//g' *.svg
rename 's/AWS//g' *.svg
rename 's/InternetOfThings_IoT/IOT/g' *.svg
rename 's/Database/DB/g' *.svg
rename 's/StorageContentDelivery/Storage/g' *.svg
svgo .





https://github.com/fokkezb/iconfont
sudo npm install -g iconfont

--------------
bthornto:cloud bthornto$
for img in $(ls *.svg) ; do inkscape --verb=FitCanvasToDrawing --verb=FileSave --verb=FileClose --verb=FileQuit `pwd`/$img ; done


https://css-tricks.com/snippets/css/a-guide-to-flexbox/
