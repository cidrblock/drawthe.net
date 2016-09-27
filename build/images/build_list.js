'use strict';

var fs = require('fs');
var path = require('path');

function getFiles(dir){
    var fileList = [];

    var files = fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        var name = path.parse(files[i]).name;
        fileList.push(name);
    }
    return fileList.sort(
            function(a, b) {
              if (a.toLowerCase() < b.toLowerCase()) return -1;
              if (a.toLowerCase() > b.toLowerCase()) return 1;
              return 0;
            }
          );
}

var fonts = {}
fonts["azure-cloud"] = getFiles("azure-cloud")
fonts["azure-enterprise"] = getFiles("azure-enterprise")
fonts["cisco"] = getFiles("cisco")

fs.writeFile('../js/fonts.json', JSON.stringify(fonts, null, 2) , 'utf-8');
