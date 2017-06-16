var winston = require('winston');
var os = require('os');
var path = require('path');
var elastic = require('./elasticsearch-connector');

function Logger(appName) {
	var logger = new (winston.Logger)({
		transports: getTransportConfig(process.env.NODE_ENV),
	});

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
			elastic.index({
				index: 'applog',
				type: 'fetcher',
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

	function getTransportConfig(env) {
		if (env === 'production') {
			return [
				new (winston.transports.Console)({
					level: process.env.LOG_LEVEL || 'info',
					handleExceptions: true,
					humanReadableUnhandledException: true,
					stderrLevels: ['error'],	// this will affect pm2 logs on prod
				}),
				new (winston.transports.File)({
					filename: process.env.SERVER_LOG_FILE || path.join(os.homedir(), 'logs/91lister-fetch.log'),
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
}


module.exports = Logger;
