"use strict";

const request = require('request');
const _ = require('lodash');
const validateNamingConvention = require('./validators').validateNamingConvention;
const validateUrl = require('./validators').validateUrl;

const Configstore = require('configstore');
const config = new Configstore('baptz');

function jsonEqual(a,b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function upsert(arr, key, newval) {
    let val = _.find(arr, key);
    if (val) {
        let index = _.indexOf(arr, _.find(arr, key));
        arr.splice(index, 1, newval);
        return ! jsonEqual(val, newval);
    } else {
        arr.push(newval);
        return true;
    }
}

module.exports = {

    downloadNamingConvention: (url) => {
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
                    config.set('lastUpdated', new Date().toISOString());
                    if (!config.get('active')) {
                        config.set('active', ncJson.name);
                    }

                    let namingConventions = config.get('namingConventions') || [];

                    let wasUpdated = upsert(namingConventions, {name: ncJson.name}, ncJson);
                    if (wasUpdated) {
                        config.set('namingConventions', namingConventions);
                        console.log(ncJson.name + ' naming convention updated');
                    }
                    else {
                        console.log('No updates found for ' + ncJson.name + ' naming convention')
                    }
                }
            }
        });
    },

    downloadAllNamingConventions: () => {
        let namingConventions = config.get('namingConventions') || [];
        namingConventions.forEach(nc => {
            module.exports.downloadNamingConvention(nc.url)
        });
    }


};


