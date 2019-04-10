const download = require('download-git-repo');
const path = require('path');
const ora = require('ora');

module.exports = async function(target) {
  target = path.join(target || '.', '.download-temp');

  // 这里可以根据具体的模板地址设置下载的url
  const url = 'https://github.com:chenshuyan9632/todo-client#master';
  const spinner = ora('正在下载项目模板');
  spinner.start();
  return new Promise((resolve, reject) => {
    download(url, target, { clone: true }, err => {
      if (err) {
        spinner.fail();
        reject(err);
      } else {
        spinner.succeed();
        // 下载的模板存放在一个临时路径中，下载完成后，可以向下通知这个临时路径，以便后续处理
        resolve(target);
      }
    });
  });
};
