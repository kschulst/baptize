"use strict";

const inquirer = require('inquirer');
const validateUrl = require('./validators').validateUrl;
const ncDownloader = require('./nc-download');

inquirer.prompt([
    {
        type: 'input',
        name: 'url',
        message: 'Url:',
        validate: (url) => validateUrl(url) ? true : "Invalid url"
    }
]).then(answers => {
    ncDownloader.downloadNamingConvention(answers.url);
});

