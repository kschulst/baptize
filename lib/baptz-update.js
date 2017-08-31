"use strict";

const Configstore = require('configstore');
const config = new Configstore('baptz');
const inquirer = require('inquirer');
const ncDownloader = require('./nc-download');

let namingConventions = config.get('namingConventions');

if (! namingConventions || namingConventions.length === 0) {
    console.log("No naming conventions registered yet. Go ahead and add one using 'baptz add'");
}
else if (namingConventions.length === 1) {
    ncDownloader.downloadNamingConvention(namingConventions[0].url);
}
else {
    let choices = namingConventions.map(nc => {
        return {name: nc.name, value: nc.url}
    });
    inquirer.prompt([
        {
            type: 'checkbox',
            name: 'urls',
            choices: choices,
            message: 'Select naming conventions to update...'
        }
    ]).then(answers => {
        answers.urls.forEach(url => ncDownloader.downloadNamingConvention(url));
    });
}
