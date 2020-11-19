const { src, dest } = require("gulp");

const sass = require("gulp-dart-sass");

const paths = {
  scss: "./src/scss/**/*.scss",
};

const css = () => {
  return src();
};
