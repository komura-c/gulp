const { src, dest, parallel, series, watch } = require("gulp");

const pug = require("gulp-pug");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");

const sass = require("gulp-dart-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const flexBugsFixes = require("postcss-flexbugs-fixes");
const declarationSorter = require("css-declaration-sorter");
const cssWring = require("csswring");

const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const webpackConfig = require("./webpack.config");

const imagemin = require("gulp-imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminMozjpeg = require("imagemin-mozjpeg");

const browserSync = require("browser-sync").create();

const paths = {
  pug: "./src/pug/**/*.pug",
  scss: "./src/scss/**/*.scss",
  js: "./src/js/**/*.js",
  image: "./src/images/**/*",
};

const html = () => {
  return src([paths.pug, "!**/_*"])
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(pug({ basedir: "./src/pug", pretty: true }))
    .pipe(dest("dist/"));
};

const css = () => {
  return src(paths.scss, { sourcemaps: true })
    .pipe(sass({ outputStyle: "expanded" }).on("error", sass.logError))
    .pipe(
      postcss([
        flexBugsFixes,
        autoprefixer({ grid: true }),
        declarationSorter({ order: "smacss" }),
        cssWring,
      ])
    )
    .pipe(dest("dist/assets/css/", { sourcemaps: "." }))
    .pipe(browserSync.stream());
};

const js = () => {
  return webpackStream(webpackConfig, webpack).pipe(dest("./dist/assets/js/"));
};

const image = () => {
  return src(paths.image)
    .pipe(
      imagemin([
        imageminPngquant({ quality: [0.65, 0.8] }),
        imageminMozjpeg({ quality: "80" }),
        imagemin.gifsicle(),
        imagemin.mozjpeg(),
        imagemin.optipng(),
        imagemin.svgo(),
      ])
    )
    .pipe(dest("./dist/assets/images/"));
};

const build = parallel(html, css, js, image);

const server = () => {
  browserSync.init({ server: "./dist" });
};

const watchFiles = () => {
  watch(paths.pug, function (cb) {
    html();
    cb();
  });
  watch(paths.scss, function (cb) {
    css();
    cb();
  });
  watch(paths.js, function (cb) {
    js();
    cb();
  });
  watch(paths.image, function (cb) {
    image();
    cb();
  });
  watch(["./dist/**/*.html"], function (cb) {
    browserSync.reload();
    cb();
  });
};

exports.html = html;
exports.css = css;
exports.js = js;
exports.image = image;

exports.build = build;

exports.default = series(build, parallel(server, watchFiles));
