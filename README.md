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
for i in ~/Downloads/3015_eps/*.eps; do inkscape $i –export-plain-svg=”/tmp/$i.svg”; done
```


remove special characters
```
rename 's/[^a-zA-Z0-9_.]//g' *.svg
```


https://github.com/fokkezb/iconfont
sudo npm install -g iconfont
