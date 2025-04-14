import gulp from 'gulp';
import {exec} from 'child_process';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import removeCode from 'gulp-remove-code';
import merge from 'merge-stream';
import del from 'del';
import gzip from 'gulp-gzip';
import htmlmin from 'gulp-htmlmin';
import smoosher from 'gulp-smoosher';
import size from 'gulp-size';
import {rollup} from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';
import {build} from 'electron-builder';
import {spawn} from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

function parseArgs() {
  let args = {};
  for (let i = 3; i < process.argv.length; i += 2) {
    let name = process.argv[i].trim().replace(/^-+/, '');
    args[name] = process.argv[i + 1].trim();
  }
  return args;
}

function clean() {
  del(['./index.html.gz', ".tsbuildinfo"]);
  return del(['dist']);
}

function js() {
  return rollup({
    input: ['dist/src/http/socket.js'],
    plugins: [
      resolve(),
      commonjs()
    ],
  }).then(bundle => bundle.write({
    file: 'dist/src/app.js',
    format: 'iife', // Use 'es' if you prefer ES modules
    name: "App",
    sourcemap: true,
  }));
}

function lang() {
  let lang = parseArgs().lang;
  return gulp.src('dist/src/app.js')
      .pipe(removeCode({de_lang_disabled: lang !== 'de'}))
      .pipe(removeCode({en_lang_disabled: lang !== 'en'}))
      .pipe(removeCode({es_lang_disabled: lang !== 'es'}))
      .pipe(removeCode({fr_lang_disabled: lang !== 'fr'}))
      .pipe(removeCode({it_lang_disabled: lang !== 'it'}))
      .pipe(removeCode({ja_lang_disabled: lang !== 'ja'}))
      .pipe(removeCode({hu_lang_disabled: lang !== 'hu'}))
      .pipe(removeCode({pl_lang_disabled: lang !== 'pl'}))
      .pipe(removeCode({ptbr_lang_disabled: lang !== 'ptbr'}))
      .pipe(removeCode({ru_lang_disabled: lang !== 'ru'}))
      .pipe(removeCode({tr_lang_disabled: lang !== 'tr'}))
      .pipe(removeCode({uk_lang_disabled: lang !== 'uk'}))
      .pipe(removeCode({zh_cn_lang_disabled: lang !== 'zh_cn'}))
      .pipe(gulp.dest('./dist/src/'));
}

// function js() {
//   return rollup({
//     input: ['dist/src/http/socket.js'],
//     plugins: [
//       typescript(),
//       nodeResolve(), // Important for resolving Node.js modules
//       resolve(),
//       commonjs(),   // Important for converting CommonJS modules to ES modules
//     ],
//     external: [  // List of external dependencies (module IDs)
//       'codemirror',
//       '@codemirror/lang-yaml',
//       '@codemirror/theme-one-dark',
//       '@codemirror/view',
//       '@codemirror/state',
//       '@codemirror/commands',
//     ],
//   }).then(bundle => bundle.write({
//     file: 'dist/src/app.js',
//     format: 'iife', // Use 'es' if you prefer ES modules
//     name: "App",
//     sourcemap: true,
//     globals: { // Map external module IDs to global variables
//       'codemirror': 'CodeMirror',
//       '@codemirror/lang-yaml': 'CodeMirrorYaml', //give a unique global name
//       '@codemirror/theme-one-dark': 'CodeMirrorOneDark', //give a unique global name
//       '@codemirror/view': 'CodeMirrorView', //give a unique global name
//       '@codemirror/state': 'CodeMirrorState', //give a unique global name
//       '@codemirror/commands': 'CodeMirrorCommands',//give a unique global name
//     },
//   }));
// }

function min() {
  return merge(
      gulp.src(['dist/src/app.js'])
          .pipe(uglify({mangle: true}))
          .pipe(gulp.dest('./dist/src/')),

      gulp.src('dist/css/style.css')
          .pipe(cleanCSS({debug: true}, function (details) {
          }))
          .pipe(gulp.dest('./dist/css/'))
  );
}

function html() {
  return merge(
      gulp.src(['images/**/*.*'])
          .pipe(gulp.dest('dist/images')),
      gulp.src(['index.html'])
          .pipe(removeCode({production: true}))
          .pipe(removeCode({cleanheader: true}))
          .pipe(smoosher())
          .pipe(htmlmin({collapseWhitespace: true, minifyCSS: true}))
          .pipe(gulp.dest('dist'))
  );
}

function zip() {
  return gulp.src('dist/index.html')
      .pipe(gzip({gzipOptions: {level: 9}}))
      .pipe(gulp.dest('.'))
      .pipe(size());
}

function ts(cb) {
  exec('npx tsc -b', (err, stdout, stderr) => {
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }
    cb(err);
  });
}

function scss() {
  const sassCompiler = gulpSass(sass);
  return gulp.src('src/scss/**/*.scss')
      .pipe(sassCompiler().on('error', sassCompiler.logError))
      .pipe(gulp.dest('dist/css'))
      .pipe(concat('style.css'))
      .pipe(gulp.dest('./dist/css/'));
}

function buildElectron() {
  return build({
    config: {
      directories: {
        output: "dist"
      },
      win: {
        target: "nsis"
      },
      mac: {
        target: "dmg"
      },
      linux: {
        target: "AppImage"
      }
    }
  });
}

gulp.task('run-electron', (done) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const isWindows = process.platform === 'win32';
  const electronPath = path.join(__dirname, 'node_modules', '.bin', isWindows ? 'electron.cmd' : 'electron');
  let url = parseArgs().url;
  console.log("Server URL: "+url)
  const electronProcess = spawn(electronPath, ['.'], { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development', SERVER_URL: url }
  });
  electronProcess.on('close', () => done()); // Exit Gulp task when Electron exits
});

gulp.task('run', gulp.series(ts, js, scss, lang, html, 'run-electron'));
gulp.task('electron',
    gulp.series(clean, ts, js, scss, lang, min, html, buildElectron));

gulp.task('compile', gulp.series(ts, js, scss, lang, html, buildElectron));
gulp.task('package', gulp.series(clean, ts, js, scss, lang, min, html, zip));
