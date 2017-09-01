#! /usr/bin/env node
/**
 * Baptz
 *
 * CLI utility that helps construct names adhering to naming conventions described in templates.
 */

'use strict';
const program = require('commander');
const moment = require('moment');
const ncDownloader = require('./nc-download');
const Configstore = require('configstore');
const config = new Configstore('baptz');

function checkForUpdates() {
    if (! config.has('autoUpdate')) {
        config.set('autoUpdate', true); // auto update is active by default
    }
    if (! config.has('autoUpdateAfterMinutes')) {
        config.set('autoUpdateAfterMinutes', 120);
    }

    if (config.get('autoUpdate')) {
        let now = moment.utc();
        let lastUpdatedISOString = config.get('lastUpdated');
        let autoUpdateAfterMinutes = config.get('autoUpdateAfterMinutes') || 1;
        let lastUpdated = (lastUpdatedISOString) ? moment.utc(lastUpdatedISOString) : now;

        if (now.diff(lastUpdated, 'seconds') > autoUpdateAfterMinutes) {
            console.log("Checking for updates...");
            ncDownloader.downloadAllNamingConventions();
        }
    }

}



checkForUpdates();

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


