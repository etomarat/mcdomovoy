#!/usr/bin/env node
import 'dotenv/config'
import { Command } from 'commander';
import fs from 'fs';

import { update } from './updater.js';
import { setMem } from './utils.js';
import { startInScreen } from './start.js'

const { SERVER_DIR_NAME, EXTRA_DIR_NAME } = process.env;

const initFolders = () => {
  if (!fs.existsSync(`./${SERVER_DIR_NAME}`)){
    fs.mkdirSync(`./${SERVER_DIR_NAME}`);
  }
  if (!fs.existsSync(`./${EXTRA_DIR_NAME}`)){
    fs.mkdirSync(`./${EXTRA_DIR_NAME}`);
  }
}
initFolders();

const program = new Command();

program.command('update')
  .description('💾 Download, update or change purpurmc version')
  .action(update);

program.command('setmem')
  .description('📊 Change server memory usage (recommended more than 1G)')
  .action(setMem);
program.command('startInScreen')
  .description('📺 Launch in the screen utility. The server will not autostart and will not reboot. Use for tests')
  .action(startInScreen);

program.parse();
