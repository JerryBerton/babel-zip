'use strict';

var fs = require('fs-extra');
var path = require('path');
var UglifyJS = require("uglify-js");
var babel = require("babel-core");
var es2015 = require('babel-preset-es2015');
var archiver = require('archiver');
var rootPath = process.cwd(); // 获取命令执行的目录
var temp = path.join(rootPath, '.temp');
var options = {
  babelrc: false,
  presets: [es2015]
};
module.exports.ensureDirSync = function () {
  if (fs.existsSync(temp)) {
    fs.removeSync(temp);
  }
  fs.ensureDirSync(temp);
};
module.exports.deleteDir = function () {
  if (fs.existsSync(temp)) {
    fs.removeSync(temp);
  }
};
module.exports.readDirs = function (dir) {
  return new Promise(function (resolve, reject) {
    fs.readdir(dir, function (err, files) {
      var dirs = [];
      if (err) reject(err);
      files.forEach(function (item) {
        var itemPath = path.join(dir, './' + item);
        var stat = fs.lstatSync(itemPath);
        if (stat.isDirectory()) {
          dirs.push({ type: 'dir', dir: item });
        } else {
          dirs.push({ type: 'file', dir: item });
        }
      });
      resolve(dirs);
    });
  });
};
module.exports.prettifyDirs = function (dir) {
  var temp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '.temp';

  return new Promise(function (resolve, reject) {
    var dirname = path.join(rootPath, dir); // 当前目录
    var outputFolder = path.join(temp, dir); // 当前目录创建的虚拟目录
    fs.mkdirSync(outputFolder); // 创建临时目录
    fs.readdir(dirname, function (err, files) {
      if (err) {
        reject(err);
      }
      files.forEach(function (file) {
        var filename = path.join(dirname, file); // 当前目录下的文件
        var outputFile = path.join(outputFolder, file);
        // console.log(filename)
        var text = fs.readFileSync(filename, 'utf8'); // 读取文件
        // js文件
        if (/\.js?$/.test(file)) {
          var result = babel.transform(text, options);
          result = UglifyJS.minify(result.code);
          text = result.code;
        }
        fs.writeFileSync(outputFile, text, 'utf8');
      });
      resolve('ok');
    });
  });
};
module.exports.zip = function () {
  return new Promise(function (resolve, reject) {
    var output = fs.createWriteStream(path.join(rootPath, '../temp.zip'));
    var archive = archiver('zip', {
      zlib: { level: 9 // Sets the compression level.
      } });
    archive.pipe(output);
    archive.on('error', function (err) {
      reject(err);
    });

    archive.glob('**/*', { cwd: path.join(rootPath, '.temp') });
    archive.finalize();
    archive.on('end', function () {
      resolve('temp.zip');
    });
  });
};