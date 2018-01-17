var elasticsearch = require('elasticsearch');

module.exports = function(elasticHost) {
	return new elasticsearch.Client({
		host: elasticHost,
		log: 'info'
	});
};
