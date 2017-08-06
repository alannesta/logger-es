// this is just a temporary solution. Will refactor once instance2 stablize
var elasticsearch = require('elasticsearch');

var inst2Config = {
	host: 'https://alannesta:112233aa@www.undefinedvariables.com/elasticsearch-docker/'
};

var instance2Client = new elasticsearch.Client(inst2Config);

module.exports = instance2Client;