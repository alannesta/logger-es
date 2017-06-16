var elasticsearch = require('elasticsearch');

var config = getElasticConfig(process.env.NODE_ENV);
var client = new elasticsearch.Client(config);

function getElasticConfig(env) {
	if (env === 'production') {
		return {
			host: process.env.ELASTICSEARCH_HOST ? process.env.ELASTICSEARCH_HOST + ':' + process.env.ELASTICSEARCH_PORT : 'localhost:9200',
			log: {
				type: 'file',
				level: 'info',
				path: process.env.ELASTIC_SEARCH_LOG || '~/logs/elastic-search.log'
			}
		};
	} else if (env === 'docker') {
		return {
			host: process.env.ELASTICSEARCH_HOST ? process.env.ELASTICSEARCH_HOST + ':9200' : 'localhost:9200',
			log: 'info'
		};
	}

	// development
	return {
		host: process.env.ELASTICSEARCH_HOST ? process.env.ELASTICSEARCH_HOST + ':9200' : 'localhost:9200',
		log: 'info'
	};
}

function getElasticUrl() {
	// default to local elasticsearch instance
	let host = 'localhost:9200';
	if (process.env.ELASTICSEARCH_HOST === 'undefined') {
		return host;
	}
	// in this case, elastic server is running remotely under nginx proxy
	if (process.env.ELASTIC_MODE && process.env.ELASTICSEARCH_MODE === 'proxy') {
		host = process.env.ELASTICSEARCH_HOST;
	} else {
		// assume elastic search is running locally in this case
		host = process.env.ELASTICSEARCH_HOST + ':' + (process.env.ELASTICSEARCH_PORT || '9200');
	}

	return host;
}

module.exports = client;
