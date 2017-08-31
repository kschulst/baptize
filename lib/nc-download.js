"use strict";

const request = require('request');
const _ = require('lodash');
const validateNamingConvention = require('./validators').validateNamingConvention;
const validateUrl = require('./validators').validateUrl;

const Configstore = require('configstore');
const config = new Configstore('baptz');



function upsert(arr, key, newval) {
    let match = _.find(arr, key);
    if (match) {
        let index = _.indexOf(arr, _.find(arr, key));
        arr.splice(index, 1, newval);
    } else {
        arr.push(newval);
    }
}

exports.downloadNamingConvention = function(url) {
    if (! validateUrl(url)) {
        throw "Invalid url " + url;
    }

    request(url, (error, response, body) => {
        if (error) {
            console.error('Error downloading naming convention from ' + url, error);
        }
        else {
            let ncJson = JSON.parse(body);
            if (validateNamingConvention(ncJson)) {
                ncJson.url = url;
                ncJson.lastUpdated = Date.now();
                if (!config.get('active')) {
                    config.set('active', ncJson.name);
                }

                let namingConventions = config.get('namingConventions') || [];
                upsert(namingConventions, {name: ncJson.name}, ncJson);
                config.set('namingConventions', namingConventions);
                console.log(ncJson.name + ' naming convention updated');
            }
        }
    });
};

