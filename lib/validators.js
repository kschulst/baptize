const schema = require('./nc-schema.json');
const Ajv = require('ajv');
const ajv = new Ajv();

exports.validateNamingConvention = function(json) {
    let valid = ajv.validate(schema, json);
    if (!valid) {
        console.error("Invalid naming convention", ajv.errors);
    }

    return valid;
}

exports.validateUrl = function(url) {
    return url.match(/\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/i);
}


exports.validateNotEmpty = function(s) {
    return s && s.length > 0;
}

