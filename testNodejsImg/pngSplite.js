var path = require("path");
var fs = require("fs");
var gm = require("gm");

var arguments = process.argv.splice(2);
console.log(`-----参数 ：`, arguments);

var filePath = arguments[0];

var obj = path.parse(filePath);
console.log(`----base:`, obj);
console.log(`----路径：`, obj.dir);
console.log(`----文件名：`, obj.name);

if(obj.ext != `.json`){
    console.log( `--------------- 不是json文件！！！！！！ ------------------------`);
    return;
}

var count = 0;
var imgDir = path.join(obj.dir, "image");
while(fs.existsSync(imgDir)){
    count ++;
    imgDir = path.join(obj.dir, "image" + count);
}
fs.mkdirSync(imgDir);

var result = JSON.parse(fs.readFileSync(filePath));
var pngName = result.file;
var pngFilePath = path.join(obj.dir, pngName);
console.log(`--图片名称：`, pngName);

for(let i in result.frames){
    let params = result.frames[i];
    let x = params.x;
    let y = params.y;
    let offx = params.offX;
    let offy = params.offY;
    let w = params.w;
    let h = params.h;
    // console.log(`---子图片名称：{key=${i}, x=${x},y=${y},w=${w},h=${h}}`);

    let imgPath = path.join(imgDir, `/${i}.png`);
    console.log(`-----图片名称：key=${i}, name=${imgPath}`);
    gm(pngFilePath).crop(w, h, x+offx, y+offy).resize(w, h).write(imgPath, function(err){
        if(err){
            console.log(err);
        }
    });
}

console.log(`切图完成~~`);