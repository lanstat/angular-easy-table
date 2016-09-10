var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var pump = require('pump');

gulp.task('compress', function (cb) {
    pump([
            gulp.src('ng-easy-table.js'),
            uglify(),
            rename(function(path){
                path.basename += '.min';
            }),
            gulp.dest('dist')
        ],
        cb
    );
});