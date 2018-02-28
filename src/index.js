#!/usr/bin/env node
const path = require('path')
const fs = require('./utils')
const chalk = require('chalk')
const ora = require('ora')
  
let rootPath = process.cwd() // 获取命令执行的目录
var program = require('commander');

program
  .version('0.1.0')
  .option('-v, --version', 'output the version number')
  .parse(process.argv);

const spinner = ora({ 
  text: '正在读取目录',
	spinner: 'star'
})
.start()
setTimeout(async () => {  
  try {
    let dirs = await fs.readDirs(rootPath) // 读取目录下所有内容
    dirs = dirs.filter(itm => itm.dir !== '.temp')
    // spinner.text = '所有文件遍历完成，共计 ' + dirs.length
    spinner.succeed('遍历完成，开始进行编译文件')
    fs.ensureDirSync()
    dirs.forEach(item => {
      if (item.type === 'dir') {
        fs.prettifyDirs(item.dir)
        .then(res => {
          let LED = chalk.yellow('=>')
          let sd = chalk.white('✔')
          console.log(LED, chalk.magenta(item.dir), sd)
        })
      }
    })
    let zip = await fs.zip()
    fs.deleteDir()
    console.log(chalk.gray('压缩目录完成:' + zip))
  } catch (error) {
    spinner.fail(error)
  }
}, 3000);