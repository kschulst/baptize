#! /usr/bin/env node
/**
 * Baptz
 *
 * CLI utility that helps construct names adhering to naming conventions described in templates.
 */

'use strict';
const program = require('commander');
const Configstore = require('configstore');
const config = new Configstore('baptz');

program
    .version(require('../package.json').version)
    .command('run', 'construct a name based on the current active naming convention - default if no command specified', {isDefault: true})
    .command('add', 'add a new naming convention')
    .command('update', 'reload naming convention(s)')
    .command('nc', 'specify naming convention to use (if multiple available)');

program.on('--help', function(){
    console.log('');
    console.log('  Active naming convention: ' + config.get('active') || 'N/A');
});

program.parse(process.argv);


