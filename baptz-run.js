'use strict';
const inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
const _ = require('lodash');
const fuzzy = require('fuzzy');
const Promise = require('promise');
const parseArgs = require('minimist');
const Configstore = require('configstore');
const config = new Configstore('baptz');
const validateNotEmpty = require('./validators').validateNotEmpty;

/**
 * Generator functions
 * -------------------
 * Can be referenced using a 'function' placeholder according to the following format:
 * f:<function name>(<args>)
 *
 * Examples:
 * f:myFunction()
 * f:myFunction(myparam, 123)
 * f:randomDigits(12)
 */
var generators = {};
generators.randomDigits = function(length) {
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

function invokeDynamicFunction(funcDef) {
  const funcRegex = /f:(.*)\((.*)\)/g;
  var match = funcRegex.exec(funcDef);
  let funcName = match[1];
  let funcArgs = null;
  if (match[2]) {
      funcArgs = parseArgs(match[2].split(/[\s,]+/))._;
  }

  let func = generators[funcName];
  if (func) {
      return func.apply(this, funcArgs);
  }
  else {
    console.error("Unknown or illegal generator expression '" + funcDef + "'. Check the template and make sure this is a valid generator function.");
  }
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
  let questions = activeNamingConvention().questions;

  return placeholders
    .filter(placeholder => !placeholder.includes(":"))
    .map(qName => {
      let q = _.find(questions, {'name': qName});
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
    type: 'input',
    validate: validateNotEmpty
  }
}

function activeNamingConvention() {
  let active = config.get('active');
  let namingConventions = config.get('namingConventions');
  return _.find(namingConventions, {name: active});
}

function searchResources(answers, input) {
  input = input || '';
  let resources = activeNamingConvention().resources;
  return new Promise(function(resolve) {
    setTimeout(function() {
      var fuzzyResult = fuzzy.filter(input, _.map(resources, 'name'));
      resolve(fuzzyResult.map(function(el) {
        return el.original;
      }));
    }, _.random(30, 500));
  });
}

function promptForResourceType() {
  let resources = activeNamingConvention().resources;
  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'resourceType',
      message: 'Resource Type?',
      source: searchResources,
      pageSize: 10,
      filter: function(val) {
        return _.find(resources, {'name': val})
      }
    }
  ]);
}

function main() {
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

main();