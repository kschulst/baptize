#! /usr/bin/env node

/**
 * Navn
 *
 * CLI utility that helps construct names adhering to naming conventions described in templates.
 */
'use strict';
var inquirer = require('inquirer');
var program = require('commander');
var _ = require('lodash');
var fuzzy = require('fuzzy');
var Promise = require('promise');
var parseArgs = require('minimist');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

var config = require('rc')("baptz", {
  "resourceTypes": [],
  "questions": []
});

/**
 * Resource template defintions
 */
/*
const resourceTypes = [
  {
    name: 'EC2::Subnet',
    template: 'sn-{regionCode}{az}-{vpcName}'
  },
  {
    name: 'S3::Bucket',
    template: "hf-s3-{regionCode}-{envCode}-{descriptiveName}-{f:uniqueDigits(12)}"
  },
  {
    name: 'EC2::VPCPeeringConnection',
    template: 'pcx-{regionCode}-{fromVpc}-to-{toVpc}'
  }
];
*/
/**
 * Question definitions
 * --------------------
 * https://github.com/SBoudrias/Inquirer.js#documentation
 */
/*
const questions = [
  {
    name: 'regionCode',
    message: 'Region?',
    type: 'list',
    choices: [
      {name: 'eu-west-1 (Ireland)', value: 'ew1', short: 'ew1'},
      {name: 'eu-west-2 (London)', value: 'ew2', short: 'ew2'},
      {name: 'eu-central-1 (Frankfurt)', value: 'ec1', short: 'ec1'}
    ],
    default: 'ew1'
  },
  {
    name: 'availabilityZone',
    message: 'Availability Zone?',
    type: 'list',
    choices: [
      'a',
      'b',
      'c',
    ]
  },
  {
    name: 'envCode',
    message: 'Environment?',
    type: 'list',
    choices: [
      {name: 'Production', value: 'p'},
      {name: 'Staging', value: 's'},
      {name: 'Development', value: 'd'}
    ]
  },
  {
    name: 'descriptiveName',
    message: 'Descriptive name:',
    type: 'input',
    validate: function (value) {
      return value.match(/^[a-zA-Z0-9_-]+$/i) ? true : "Please enter a valid descriptive name. Only alphanumeric characters, underscores and hyphens are allowed."
    }
  }
];
*/

/**
 * Generator functions
 * -------------------
 * Can be referenced using a 'function' placeholder according to the following format:
 * f:<function name>(<args>)
 *
 * Examples:
 * f:myFunction()
 * f:myFunction(myparam, 123)
 * f:uniqueDigits(12)
 */
var generators = {};
generators.uniqueDigits = function(length) {
  var digits = "0123456789";
  let result = '';
  for (var i = length; i > 0; --i) {
    result += digits[Math.floor(Math.random() * 10)];
  }
  return result; 
};








/**
 * Internals
 */

function invokeDynamicFunction(functionDef) {
  const funcRegex = /f:(.*)\((.*)\)/g;
  var match = funcRegex.exec(functionDef);
  let funcName = match[1];
  let funcArgs = null;
  if (match[2]) {
      funcArgs = parseArgs(match[2].split(/[\s,]+/))._;
  }

  return generators[funcName].apply(this, funcArgs);
}

function invokeDynamicFunctions(placeholders) {
  let results = {};
  placeholders.forEach(p => {
    if (p.startsWith("f:")) {
      results[p] = invokeDynamicFunction(p);
    }
  });

  return results;
}

function parseTemplate(template) {
  return template.match(/\{[\w\s:)(,']+\}/g).map(s=>s.slice(1,-1));
}

function populateTemplate(template, answers) {
  let result = template;
  Object.keys(answers).forEach(function(key) {
    result = result.replace("{" + key + "}", answers[key]);
  })

  return result;
}

function findQuestions(placeholders) {
  return placeholders
    .filter(placeholder => !placeholder.includes(":"))
    .map(qName => {
      let q = _.find(config.questions, {'name': qName});
      if (!q) {
        q = newInputQuestion(qName);
      }

      return q;
    });
}

function newInputQuestion(name) {
  let message = name
    // insert a space before all caps
    .replace(/([A-Z])/g, ' $1')
    // uppercase the first character
    .replace(/^./, function(str){ return str.toUpperCase(); });

  return {
    name: name,
    message: message + ':',
    type: 'input'
  }
}

function searchResourceTypes(answers, input) {
  input = input || '';
  return new Promise(function(resolve) {
    setTimeout(function() {
      var fuzzyResult = fuzzy.filter(input, _.map(config.resourceTypes, 'name'));
      resolve(fuzzyResult.map(function(el) {
        return el.original;
      }));
    }, _.random(30, 500));
  });
}

function promptForResourceType() {
  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'resourceType',
      message: 'Resource Type?',
      source: searchResourceTypes,
      pageSize: 10,
      filter: function(val) {
        return _.find(config.resourceTypes, {'name': val})
      }
    }
  ]);
}

function start() {
  promptForResourceType().then(function(answers) {
    let resourceType = answers.resourceType;
    let placeholders = parseTemplate(resourceType.template);
    let functionResults = invokeDynamicFunctions(placeholders)
    let resourceQuestions = findQuestions(placeholders);

    inquirer.prompt(resourceQuestions).then(function(answers) {
      Object.assign(answers, functionResults);
      let res = populateTemplate(resourceType.template, answers);
      console.log(res);
    });
  });
}


start();