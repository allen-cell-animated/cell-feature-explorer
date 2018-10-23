const DevServers = require('../webpack/server-urls-dev.json')

// set global vars from all the values in the json file.
// assumes the json file is an object of string:string
Object.keys(DevServers).forEach((key) => {
    global[key] = DevServers[key];
});
