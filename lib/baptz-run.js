'use strict';
const inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));
const _ = require('lodash');
const fuzzy = require('fuzzy');
const Promise = require('promise');
const parseArgs = require('minimist');
const Configstore = require('configstore');
const config = new Configstore('baptz');
const validators = require('./validators');
const generators = require('./generators');
const filters = require('./question-filters');

function nativeQuestions() {
  let resources = activeNamingConvention().resources;

  return [
      {
          name: 'resourceRef',
          type: 'autocomplete',
          message: 'Referenced resource:',
          source: searchResources,
          pageSize: 10,
          filter: function (val) {
              let res = _.find(resources, {'name': val});
              return filters.pc(res.shortname);
          }
      }
  ];
}

function invokeDynamicFunction(funcDef) {
  const funcRegex = /f:(.*)\((.*)\)/g;
  let match = funcRegex.exec(funcDef);
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
  });

  return result;
}

function parseQuestions(questionsJson) {
    let questions = questionsJson.map(q => {
      if (q.validate && (typeof q.validate === 'string')) {
        let validateFunc = validators[q.validate];
        if (! validateFunc) {
          console.log("Error: Invalid validation function '" + q.validate + "'. Make sure you are using a valid validator function. RTFM ;-)")
          process.exit(1);
        }
        else {
            q.validate = validateFunc;
        }
      }
      return q;
    });

    questions = questions.concat(nativeQuestions());
    return questions;
}

function findQuestions(placeholders, answers) {
  let questions = parseQuestions(activeNamingConvention().questions);

  return placeholders
    .filter(placeholder => !placeholder.includes("f:")) // ignoring generator functions
    .filter(placeholder => answers[placeholder] === undefined) // ignoring already answered questions
    .map(placeholder => {
      let tokens = placeholder.split(":");
      let qName = tokens.pop();
      let filterName = tokens.pop();
      let q = _.find(questions, {name: qName});
      if (!q) {
        q = newInputQuestion(qName, placeholder);
      } else {
          q.name = placeholder;
      }

      if (filterName) {
          q.filter =  filters[filterName];
          if (! q.filter) {
            console.log("Error: Unknown filter function '" + filterName + "'. Make sure you are using a valid filter. RTFM ;-)")
            process.exit(1);
          }
      }

      return q;
    });
}

function newInputQuestion(name, placeholder) {
  let message = name
    // insert a space before all caps
    .replace(/([A-Z])/g, ' $1')
    // uppercase the first character
    .replace(/^./, function(str){ return str.toUpperCase(); });

  return {
    name: placeholder,
    message: message + ':',
    type: 'input',
    validate: validators.validateNotEmpty
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
      let fuzzyResult = fuzzy.filter(input, _.map(resources, 'name'));
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
  if (! config.get('active')) {
      console.log("No naming conventions installed yet. Go ahead and add one by typing 'baptz add'");
      process.exit(0);
  }

  promptForResourceType().then(function(answers) {
    let resourceType = answers.resourceType;
    let defaultAnswers = {
        shortname: resourceType.shortname
    };
    let placeholders = parseTemplate(resourceType.template);
    let functionResults = invokeDynamicFunctions(placeholders);
    let resourceQuestions = findQuestions(placeholders, defaultAnswers);

    inquirer.prompt(resourceQuestions).then(function(answers) {
      Object.assign(answers, defaultAnswers);
      Object.assign(answers, functionResults);
      let res = populateTemplate(resourceType.template, answers);
      console.log(res);
    });
  });
}

main();