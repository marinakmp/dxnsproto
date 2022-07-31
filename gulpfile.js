const assetsSource = "src/assets/styles/";
const { src, dest, watch, series } = require("gulp");

const del = require("del"),
  sass = require("gulp-sass")(require("node-sass")),
  sourcemaps = require("gulp-sourcemaps"),
  autoprefixer = require("gulp-autoprefixer"),
  cleanCSS = require("gulp-clean-css"),
  rename = require("gulp-rename");

const browserSync = require("browser-sync").create();

// Watch
function watchFiles() {
  browserSync.init({
    server: {
      baseDir: "./src",
    },
  });
  watch(assetsSource + "**/*.scss", css);
}

// Compile sass to css
function css() {
  return src([assetsSource + "**/*.scss"])
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(sourcemaps.write())
    .pipe(dest(assetsSource + "css"))
    .pipe(browserSync.stream());
}

// CSS export: compact
function cssbuild() {
  return src([assetsSource + "css/*.css", "!" + assetsSource + "css/*.min.css"])
    .pipe(
      cleanCSS({
        format: "keep-breaks",
        level: 1,
      })
    )
    .pipe(autoprefixer())
    .pipe(dest(assetsSource + "css"));
}

// CSS export: compressed
function cssminTask() {
  return src([assetsSource + "css/skeleton.css", assetsSource + "css/theme.css"])
    .pipe(cleanCSS())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(assetsSource + "css/"));
}

// Remove unnecessary files
function clean() {
  return del([assetsSource + "css/skeleton.css", assetsSource + "css/theme.css"]);
}

// Watch & reload
exports.build = series(css, cssbuild, cssminTask, clean);
exports.default = series(css, watchFiles);
exports.css = css;
exports.cssbuild = cssbuild;
exports.cssmin = cssminTask;
exports.clean = clean;