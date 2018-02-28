#!/usr/bin/env node
'use strict';

var path = require('path');
var fs = require('./utils');
var chalk = require('chalk');
var ora = require('ora');

var rootPath = process.cwd(); // 获取命令执行的目录
var program = require('commander');

program.version('0.1.0').option('-v, --version', 'output the version number').parse(process.argv);

var spinner = ora({
  text: '正在读取目录',
  spinner: 'star'
}).start();
setTimeout(function () {
  var dirs, zip;
  return Promise.resolve().then(function () {
    return Promise.resolve().then(function () {
      return fs.readDirs(rootPath);
    }).then(function (_resp) {
      dirs = _resp; // 读取目录下所有内容

      dirs = dirs.filter(function (itm) {
        return itm.dir !== '.temp';
      });
      // spinner.text = '所有文件遍历完成，共计 ' + dirs.length
      spinner.succeed('遍历完成，开始进行编译文件');
      fs.ensureDirSync();
      dirs.forEach(function (item) {
        if (item.type === 'dir') {
          fs.prettifyDirs(item.dir).then(function (res) {
            var LED = chalk.yellow('=>');
            var sd = chalk.white('✔');
            console.log(LED, chalk.magenta(item.dir), sd);
          });
        }
      });
      return fs.zip();
    }).then(function (_resp) {
      zip = _resp;

      fs.deleteDir();
      console.log(chalk.gray('压缩目录完成:' + zip));
    }).catch(function (error) {
      spinner.fail(error);
    });
  }).then(function () {});
}, 3000);