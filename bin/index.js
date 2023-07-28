#! /usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import path from "path";
import fs from "fs-extra";
import select, { Separator } from "@inquirer/select";
import download from "download-git-repo";
import ora from "ora";
import { PROJECTLIST } from "./data.js";
const program = new Command();

const log = console.log;

program.on("--help", () => {
  log(
    "\r\n" +
      chalk.white.bgBlueBright.bold(
        figlet.textSync("kif template cli", {
          font: "Standard",
          horizontalLayout: "default",
          verticalLayout: "default",
          width: 80,
          whitespaceBreak: true,
        })
      )
  );
  log(
    `\r\nRun ${chalk.cyan(
      `fe <command> --help`
    )} for detailed usage of given command\r\n`
  );
});

program
  .name("kif template cli")
  .description("🚀🚀~ kif 的项目初始化脚手架 ~  🚀🚀")
  .version("1.0.0");

program
  .command("create <name>")
  .description("🚀 Create a new project\n")
  .action(async (name) => {
    console.log("🍓 Project name -->" + name + "\n\n");
    // 当前命令行执行的目录
    const cwd = process.cwd();
    // 需要创建的目录
    const targetPath = path.join(cwd, name);
    if (fs.existsSync(targetPath)) {
      const deleteD = await deleteDir();
      if (deleteD) {
        log("💢 Remove an existing directory!\n");
        await fs.remove(targetPath);
      } else {
        return;
      }
    }
    const tempUrl = await selectTemp();
    log("🔪 Will download from https://github.com/" + tempUrl + "\n\n");

    const spinner = ora(
      "💘 The remote github repository starts downloading..."
    );
    spinner.start();
    // 下载远端模版
    download(
      tempUrl,
      targetPath,
      {
        clone: true,
      },
      (err) => {
        if (err) {
          spinner.fail("💔 Download failure");
        } else {
          spinner.succeed("💞 Download successfully");
        }
      }
    );
  });
program.parse(process.argv);

async function deleteDir() {
  return select({
    message: "The directory already exists, please select:\n",
    choices: [
      {
        name: "🛀 Overwrite",
        value: true,
        description: "Overwrite original item",
      },
      {
        name: "✖️ Cancel",
        value: false,
        description: "Cancel",
      },
    ],
  });
}

async function selectTemp() {
  return select({
    message: "😀 Select a template\n",
    choices: PROJECTLIST,
  });
}
