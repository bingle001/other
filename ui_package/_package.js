//--------------------------------------------------------------
//TextureMerger所在的路径 
let TextureMergerPath = `D:\\Egret\\TextureMerger\\TextureMerger.exe`;
//资源Truck路径
let TrunkPath = `E:\\trunk\\`;
//--------------------------------------------------------------

var fs = require("fs");
var path = require("path");
var exec = require("child_process").execSync;

var OutPutPath = path.join(TrunkPath, "client\\resource\\assets");//导出资源存放路径
var DefaultResJson1 = path.join(TrunkPath, "eui\\resource\\default.res.json");//素材管理json路径
var DefaultResJson2 = path.join(TrunkPath, "client\\resource\\default.res.json");//发布素材管理json路径

let defaultResJsonData = JSON.parse(fs.readFileSync(DefaultResJson1));
let root = process.cwd();
console.log("当前目录：", root);

var arguments = process.argv.splice(2);
var filePath = arguments[0];

console.log("\n---------------开始打包------------------");
if(filePath){
	let argsSep = path.parse(filePath);
	console.log("打包参数：", argsSep.name + "\n");
	packageDir(path.join(root, argsSep.name));//单独文件夹打包
}
else{
	console.log("打包参数：res_ui\n");
	packagePath(root);//整个res_ui打包
}


function packagePath(curPath){
	let files = fs.readdirSync(curPath);
	for(let i in files){
		let filedir = path.join(curPath, files[i]);
		packageDir(filedir);
	}
}

//打包一个文件夹
function packageDir(filedir){
	let stat = fs.statSync(filedir);
	if(stat.isDirectory()){
		let sep = path.parse(filedir);
		let pStr = getDirectoryName(filedir);
		if(!pStr){
			console.log( `空文件夹，略过 ： `, sep.name+"\n");
			return;
		}
		
		console.log("打包文件夹：", sep.name);
		let outFile = path.join(OutPutPath, sep.name + ".json");
		let cmdStr = TextureMergerPath + ` -p ` + pStr + ` -o ` + outFile;
		//console.log("打包完整语句：", cmdStr);
		exec(cmdStr);
		console.log("打包完成 --- outFile=", outFile);
		
		//修改json
		mergerJson(outFile);
	}
}

function getDirectoryName(filePath){
	let str = ``;
	let files = fs.readdirSync(filePath);
	for(let i in files){
		let filedir = path.join(filePath, files[i]);
		let stat = fs.statSync(filedir);
		if(stat.isDirectory()){
			str += filedir + ` `;
			str += getDirectoryName(filedir);
		}
	}
	return str;
}

//修改json
function mergerJson(uiJsonFile){
	//console.log("修改json文件：", uiJsonFile);
	let sep = path.parse(uiJsonFile);
	let jsonKey = sep.name + "_json";
	let subkeys = getJsonSubKeys(uiJsonFile);
	//console.log("json key:", jsonKey);
	let data = getKeyDataInJson(jsonKey, defaultResJsonData.resources);
	if(data){
		data.subkeys = subkeys;
	}
	else{
		let data = {};
		data.url = "assets/" + sep.name + ".json";
		data.type = "sheet";
		data.name = jsonKey;
		data.subkeys = subkeys;
		defaultResJsonData.resources.push(data);
	}
}

//在json数组里获取目标key的内容
function getKeyDataInJson(key, jsonArr){
	for(let i in jsonArr){
		let data = jsonArr[i];
		if(data.name == key){
			return data;
		}
	}
	return null;
}

function getJsonSubKeys(uiJsonFile){
	let jsonData = JSON.parse(fs.readFileSync(uiJsonFile));
	let subKey = ``;
	for(let i in jsonData.frames){
		if(subKey != ``){
			subKey += `,`;
		}
		subKey += i;
	}
	//console.log(`subKey:`, subKey);
	return subKey;
}





//写入default.res.json 并移动
let jsonStr = JSON.stringify(defaultResJsonData, null, 4);
jsonStr = jsonStr.replace(new RegExp("    ", 'gm'), "\t");
fs.writeFileSync(DefaultResJson1, jsonStr);
console.log("\n修改 default.res.json 完成");
exec(`copy /y ` + DefaultResJson1 + ` ` + DefaultResJson2);
console.log("移动 default.res.json 完成");

console.load("\n--------------打包结束-------------------");