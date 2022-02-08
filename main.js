#!/usr/bin/env node
import 'dotenv/config'
import { Command } from 'commander';

import { update } from './updater.js';

const program = new Command();

program.command('update')
  .description('change purpurmc version')
  .action(update);

program.parse();
