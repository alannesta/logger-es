var elasticsearch = require('elasticsearch');

module.exports = function(elasticHost) {
	return new elasticsearch.Client({
		host: elasticHost,
		log: 'info'
	});
};

// function getElasticUrl() {
// 	// default to local elasticsearch instance
// 	let host = 'localhost:9200';
// 	if (process.env.LOG_ELASTICSEARCH_HOST === undefined) {
// 		return host;
// 	}
// 	// in this case, elastic server is running remotely under nginx proxy
// 	if (process.env.ELASTICSEARCH_MODE && process.env.LOG_ELASTICSEARCH_MODE === 'proxy') {
// 		host = process.env.LOG_ELASTICSEARCH_HOST;
// 	} else {
// 		// assume elastic search is running locally in this case, PORT needs to be specified
// 		host = process.env.LOG_ELASTICSEARCH_HOST + ':' + (process.env.LOG_ELASTICSEARCH_PORT || '9200');
// 	}
//
// 	return host;
// }

