
const gulp = require('gulp');
const babel = require('gulp-babel');
const exec = require('child_process').exec
gulp.task('link', function() {
  exec('npm link', function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  })
})
// 编译并压缩js
gulp.task('convertJS', function(){
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015'],
      plugins: ['async-to-promises']
    }))
  
    .pipe(gulp.dest('bin'))
})
// 监视文件变化，自动执行任务
gulp.task('watch', function(){
  gulp.watch('src/**/*.js', ['convertJS', 'link']);
})

gulp.task('default', ['convertJS', 'link', 'watch']);