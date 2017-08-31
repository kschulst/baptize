"use strict";

const Configstore = require('configstore');
const config = new Configstore('baptz');
const inquirer = require('inquirer');

let namingConventions = config.get('namingConventions');
let currentActive = config.get('active');

if (! namingConventions || namingConventions.length === 0) {
    console.log("No naming conventions available. Go ahead and add one by typing 'baptz add'");
}
else if (namingConventions.length === 1) {
    console.log("Current active naming convention is " + currentActive + ". This is the only naming convention installed.");
}
else {
    console.log('Current active naming convention is ' + currentActive);
    let choices = namingConventions.map(nc => {
        return {name: nc.name}
    });
    inquirer.prompt([
        {
            type: 'list',
            name: 'active',
            choices: choices,
            default: currentActive,
            message: 'Active naming convention:'
        }
    ]).then(answers => {
        config.set('active', answers.active);
    });
}
