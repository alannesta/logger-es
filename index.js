var winston = require('winston');
var os = require('os');
var path = require('path');
var elasticConnector = require('./elastic-connector');

function Logger(appName, env = 'development', logLevel, logFileLocation, elasticHost = 'localhost:9200') {
	var logger = new (winston.Logger)({
		transports: getTransportConfig(env, logLevel, logFileLocation),
	});

	const elasticClient = elasticConnector(elasticHost);

	const wrappedMethods = ['info', 'error'];

	wrappedMethods.forEach((method) => {

		const unwrapped = logger[method];
		logger[method] = function(...args) {
			let message = '';

			if (args.length > 1) {
				message = args[0] + JSON.stringify(args[1]);
			} else {
				message = args[0];
			}

			// call the original logger method
			unwrapped.apply(null, args);

			// index to elastic search
			elasticClient.index({
				index: 'applog',
				type: appName,
				body: {
					timestamp: new Date(),
					message: message,
					level: method
				}
			}, (error, response) => {
				if (error) {
					console.log('log to elastic error ---> ', error);
				}
			});
		};
	});

	function getTransportConfig(env, logLevel, logFileLocation) {
		if (env === 'production') {
			return [
				new (winston.transports.Console)({
					level: logLevel || 'info',
					handleExceptions: true,
					humanReadableUnhandledException: true,
					stderrLevels: ['error'],	// this will affect pm2 logs on prod
				}),
				new (winston.transports.File)({
					filename: logFileLocation || path.join(os.homedir(), 'logs/91lister-fetch.log'),
					level: 'info',
					json: false,
					handleExceptions: true,
					humanReadableUnhandledException: true,
					maxsize: 500000,
				}),
			];
		} else if (env === 'docker') {
			// do not write to logs on docker
			return [
				new (winston.transports.Console)({
					level: 'debug',
					handleExceptions: true,
					humanReadableUnhandledException: true,
					stderrLevels: ['error'],
				}),
			];
		}

		return [
			new (winston.transports.Console)({
				level: 'debug',
				handleExceptions: true,
				humanReadableUnhandledException: true,
				stderrLevels: ['error'],	// this will affect pm2 logs on prod
			}),
			new (winston.transports.File)({
				filename: path.join(os.homedir(), 'logs/91lister-fetch.log'),
				level: 'debug',
				handleExceptions: true,
				humanReadableUnhandledException: true,
				maxsize: 500000,
				json: false,
			}),
		];
	}

	return logger;
}


module.exports = Logger;
