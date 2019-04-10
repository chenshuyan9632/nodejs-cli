const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const rm = require('rimraf').sync;

module.exports = function(metadata = {}, src, dest) {
  if (!src) {
    return Promise.reject(new Error(`无效的source：${src}`));
  }
  return new Promise((resolve, reject) => {
    Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest)
      .use((files, metalsmith, done) => {
        const meta = metalsmith.metadata();
        Object.keys(files).forEach(fileName => {
          if (fileName.match(/package.json$/)) {
            const t = files[fileName].contents.toString();
            files[fileName].contents = Buffer.from(Handlebars.compile(t)(meta));
          }
        });
        done();
      })
      .build(err => {
        // 移除临时包
        rm(`${dest}/.download-temp`);
        err ? reject(err) : resolve();
      });
  });
};
