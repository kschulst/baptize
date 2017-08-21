const download = require('download');


var config = require('rc')("baptz", {
  "namingConventions": [
    { "name": "tine-aws",
      "url": "https://raw.githubusercontent.com/kschulst/bootiful-microservices-config/master/auth-service.properties"
    }
  ]
});

console.log("update!!!");

config.namingConventions.forEach(nc => {
	console.log("config", config.configs);
	let configFile = config.configs[0];
	let path = configFile.substring(0, configFile.lastIndexOf('/'));
	download(nc.url, path, {filename: nc.name + ".json"});
//	console.log("nc", nc.name, nc.url, config.configs[0]);
});

//download('', 'dist').then(() => {
//    console.log('done!');
//});