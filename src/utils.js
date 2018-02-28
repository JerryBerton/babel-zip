const fs = require('fs-extra')
const path = require('path')
const UglifyJS = require("uglify-js")
const babel = require("babel-core")
const es2015 = require('babel-preset-es2015')
const archiver = require('archiver');
const rootPath = process.cwd() // 获取命令执行的目录
let temp = path.join(rootPath, '.temp')
const options = {
  babelrc: false,
  presets: [es2015]
}
module.exports.ensureDirSync = () => {
  if (fs.existsSync(temp)) {
    fs.removeSync(temp)
  }
  fs.ensureDirSync(temp)
}
module.exports.deleteDir = () => {
  if (fs.existsSync(temp)) {
    fs.removeSync(temp)
  }
}
module.exports.readDirs =  (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      let dirs = []
      if (err) reject(err)
      files.forEach(item => {
        let itemPath = path.join(dir, './' + item )
        let stat = fs.lstatSync(itemPath)
        if (stat.isDirectory()) {
          dirs.push({ type: 'dir', dir: item})
        } else {
          dirs.push({ type: 'file', dir: item})
        }
      })
      resolve(dirs)
    })
  })
}
module.exports.prettifyDirs = (dir, temp = '.temp') => {
  return new Promise((resolve, reject) => {
    let dirname = path.join(rootPath, dir) // 当前目录
    let outputFolder = path.join(temp, dir) // 当前目录创建的虚拟目录
    fs.mkdirSync(outputFolder)  // 创建临时目录
    fs.readdir(dirname, (err, files) => {
      if (err) {
        reject(err)
      }
      files.forEach(file => {
        let filename = path.join(dirname, file) // 当前目录下的文件
        let outputFile = path.join(outputFolder, file)
        // console.log(filename)
        let text = fs.readFileSync(filename, 'utf8') // 读取文件
        // js文件
        if (/\.js?$/.test(file)) {
          let result = babel.transform(text, options)
          result = UglifyJS.minify(result.code);
          text = result.code
        }
        fs.writeFileSync(outputFile, text, 'utf8')
      })
      resolve('ok')
    })
  })
}
module.exports.zip = () => {
  return new Promise((resolve, reject) => {
    var output = fs.createWriteStream(path.join(rootPath, '../temp.zip'));
    var archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });
    archive.pipe(output)
    archive.on('error', (err) => {
      reject(err)
    })
    
    archive.glob('**/*', {cwd: path.join(rootPath, '.temp') })
    archive.finalize()
    archive.on('end', () => {
      resolve('temp.zip')
    })
  })
}