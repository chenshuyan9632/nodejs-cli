#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const inquirer = require('inquirer');
const rm = require('rimraf').sync;
const chalk = require('chalk');
const logSymbols = require('log-symbols');
const download = require('../lib/download');
const generator = require('../lib/generator');

async function create() {
  program.usage('<app-name>').parse(process.argv);
  let appName = program.args[0];

  if (!appName) {
    // 相当于执行命令的--help选项，显示help信息
    console.log('请输入项目名称');
    program.help();
    return;
  }

  const list = glob.sync('*'); // 遍历当前目录
  // process.cwd()：获得当前执行node命令时候的文件夹目录名
  let rootName = path.basename(process.cwd());
  let answers;

  if (list.length) {
    // 如果当前目录不为空
    if (
      list.filter(name => {
        const fileName = path.resolve(process.cwd(), path.join('.', name));
        const isDir = fs.statSync(fileName).isDirectory();
        return name.indexOf(appName) !== -1 && isDir;
      }).length !== 0
    ) {
      console.log(`项目${appName}已经存在`);
      return;
    }
    rootName = appName;
  } else if (rootName === appName) {
    answers = await inquirer.prompt([
      {
        name: 'buildInCurrent',
        message:
          '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
        type: 'confirm',
        default: true,
      },
    ]);
    rootName = answers.buildInCurrent ? '.' : appName;
  } else {
    rootName = appName;
  }

  await download(rootName);

  answers = await inquirer.prompt([
    {
      name: 'projectName',
      message: '项目的名称',
      default: appName,
    },
    {
      name: 'projectVersion',
      message: '项目的版本号',
      default: '1.0.0',
    },
    {
      name: 'projectDescription',
      message: '项目的简介',
      default: `A project named ${appName}`,
    },
  ]);
  await generator(answers, `${rootName}/.download-temp`, rootName);
  console.log(rootName);
  console.log(logSymbols.success, chalk.green('创建成功:)'));
}

try {
  create();
} catch (error) {
  rm(rootName);
  console.error(logSymbols.error, chalk.red(`创建失败：${error.message}`));
}
