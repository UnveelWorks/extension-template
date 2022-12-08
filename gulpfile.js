'use strict';
const Gulp = require("gulp");
const Del = require("del");
const GulpChange = require("gulp-change");
const Plugins = require("gulp-load-plugins")();
const { createGulpEsbuild } = require('gulp-esbuild');
const Sass = require("gulp-sass")(require("sass"));
const argv = require('yargs').argv;
const { prod: isProd, firefox: isFirefox } = argv;
const pkg = require("./package.json");
const config = require("./config.json");

const gulpEsbuild = createGulpEsbuild({ piping: true })
const ensureArray = path => Array.isArray(path) ? path : [path];
const dynamicFunc = (action, name) => 
{
    const f = action;
    Object.defineProperty(f, 'name', {
        value: name,
        writable: false
    });
    return f;
};

const checkPlatform = (plaform) => 
{
    const buildPlatform = isFirefox ? "firefox" : "chrome";
    if (plaform && buildPlatform !== plaform) return false; 
    else return true;
}

const clean = () => Del([config.dist + '/*']);

const script = ({ src, name, platform }, done = _ => true) => 
{
    if (!checkPlatform(platform)) return Gulp.src(src).on('end', done);

    const esbuildOptions = {
        outfile: `${name}.js`,
        bundle: true,
        sourcemap: isProd ? false : "linked",
        minify: isProd ? true : false
    };

    return Gulp.src(src)
        .pipe(gulpEsbuild(esbuildOptions))
        .on('error', (err) => {
            console.log(err.toString());
            this.emit('end');
        })
        .pipe(Plugins.rename(path => {
            path.dirname = '';
            path.basename = name;
        }))
        .pipe(Gulp.dest(config.dist))
        .on('end', done);
}

const style = ({src, name, platform}, done = _ => true) => 
{
    if (!checkPlatform(platform)) return Gulp.src(src).on('end', done);

    return Gulp.src(src)
        .pipe(Sass().on('error', Sass.logError))
        .pipe(Plugins.concat(`${name}.css`))
        .pipe(Plugins.cleanCss())
        .pipe(Plugins.rename((path) => 
        {
            path.dirname = '';
            path.basename = name;
        }))
        .pipe(Gulp.dest(config.dist))
        .on('end', done);
};

const copy = (src, done = _ => true) => 
{
    if (src.endsWith('*')) {
        return Gulp.src(src, {base: 'src'})
            .pipe(Gulp.dest(config.dist))
            .on('end', done);
    }

    // copy single file or directory
    return Gulp.src(src)
        .pipe(Plugins.rename(path => {
            path.dirname = '';
        }))
        .pipe(Gulp.dest(config.dist))
        .on('end', done);
};

const locale = (language, done = _ => true) => 
{
    return Gulp.src(config.locales_dir + language + '/**/*.json')
        .pipe(Plugins.mergeJson({fileName: 'messages.json'}))
        .pipe(Plugins.jsonminify())
        .pipe(Gulp.dest(config.dist + '/_locales/' + language))
        .on('end', done);
};

const copyManifest = done => {

    const { name, short_name, description, version } = pkg;

    const performChange = (content) => 
    {
        let mft = JSON.parse(content);

        mft.name = name;
        mft.short_name = short_name;
        mft.description = description;
        mft.version = version;
        mft.version_name = version;

        if (isFirefox && mft.firefox) mft = {...mft, ...mft.firefox};
        else if (!isFirefox && mft.chrome) mft = {...mft, ...mft.chrome};
        delete mft.chrome;
        delete mft.firefox;

        return JSON.stringify(mft);
    };

    return Gulp.src(config.manifest)
        .pipe(GulpChange(performChange))
        .pipe(Plugins.jsonminify())
        .pipe(Plugins.rename(path => {
            path.dirname = '';
            path.basename = 'manifest';
            path.extname = '.json';
        }))
        .pipe(Gulp.dest(config.dist))
        .on('end', done);
};

const copyAssets = done => 
{
    return Gulp.src(config.assets)
        .pipe(Gulp.dest(config.dist + '/assets'))
        .on('end', done);
};

const buildHtml = done => 
{
    return Gulp.src(config.html)
        .pipe(Plugins.htmlmin({collapseWhitespace: true}))
        .pipe(Plugins.rename(path => {
            path.dirname = '';
        }))
        .pipe(Gulp.dest(config.dist))
        .on('end', done);
};

const scripts = config.js_bundles.map(obj => dynamicFunc(_ => script(obj), `${obj.name}.js`));
const styles = config.scss_bundles.map(obj => dynamicFunc(_ => style(obj), `${obj.name}.css`));
const locales = config.locales_list.map(lang => dynamicFunc(_ => locale(lang), `locale ${lang}`));
const copies = ensureArray(config.copy).map(obj => dynamicFunc(_ => copy(obj), `copy ${obj}`));

const release = done => 
{
    if (!isProd) return done();
    return Gulp.src(config.dist + '/**/*')
        .pipe(Plugins.zip(`${config.release_name || 'release'}.zip`))
        .pipe(Gulp.dest(config.releases))
        .on('end', done);
};

const build = Gulp.series(
    clean,
    Gulp.parallel(
        ...scripts,
        ...styles,
        ...copies,
        ...locales,
        copyManifest,
        copyAssets,
        buildHtml
    ),
    release
);

const watch = () => 
{
    console.log('[1m[33mWatching...[39m[22m');
    if (scripts.length) Gulp.watch(ensureArray(config.js), Gulp.parallel(...scripts));
    if (styles.length) Gulp.watch(ensureArray(config.scss), Gulp.parallel(...styles));
    if (copies.length) Gulp.watch(ensureArray(config.copy), Gulp.parallel(...copies));
    if (config.locales_list.length) Gulp.watch(config.locales_dir + '**/*.json', Gulp.parallel(...locales));
    Gulp.watch(config.manifest, copyManifest);
    Gulp.watch(ensureArray(config.html), buildHtml);
    Gulp.watch(ensureArray(config.assets), copyAssets);
};

exports.default = build;
exports.watch = Gulp.series(build, watch);