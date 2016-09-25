### development
npm install
grunt


### adding icons
remove special characters
```
rename 's/[^a-zA-Z0-9_.]//g' *.svg
```


converting from eps to svg
1. install xquartz
2. install inkscape


sudo ln -s /Applications/Inkscape.app/Contents/Resources/bin/inkscape /usr/local/bin

```
for i in `pwd`/*.eps; do inkscape $i –export-plain-svg=$i.svg”; done

for i in `pwd`/*.svg; do inkscape $i -E ${i%.svg}.eps; done
rm *.svg
for i in `pwd`/*.eps; do inkscape $i -l ${i%.eps}.svg; done

```


azure-clous```
cp ~/Downloads/Microsoft_CloudnEnterprise_Symbols_v2.5_PUBLIC/Symbols/CnE_Cloud/SVG/*.svg .
rename 's/[^a-zA-Z0-9_.]//g' *.svg
rename 's/^Azure//g' *.svg
rm *COLOR*
for i in `pwd`/*.svg; do inkscape $i -E ${i%.svg}.eps; done
rm *.svg
for i in `pwd`/*.eps; do inkscape $i -l ${i%.eps}.svg; done
rm *.eps
cd ../..
iconfont azure-cloud.css
cp azure-cloud.js ../js/
```

cisco
cp ~/Downloads/3015_eps/*.eps .



https://github.com/fokkezb/iconfont
sudo npm install -g iconfont

--------------
bthornto:cloud bthornto$
for img in $(ls *.svg) ; do inkscape --verb=FitCanvasToDrawing --verb=FileSave --verb=FileClose --verb=FileQuit `pwd`/$img ; done


https://css-tricks.com/snippets/css/a-guide-to-flexbox/
