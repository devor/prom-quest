'use strict';

const https = require('https');
const http = require('http');
const url = require('url');
const Promise = require('es6-promise').Promise;

/**
 * Export this request Object
 * @type {Object}
 */
const request = {
	_request(options) {
		const urlParse = url.parse(options.url);
		const isHttps = urlParse.protocol === 'https:';
		const protocol = isHttps ? https : http; // Native node methods

		// Set up the options
		options.hostname = urlParse.hostname;
		options.port =  isHttps ? 443 : 80;
		options.path = urlParse.pathname;
		options.method = options.method;
		options.headers  = options.headers || {};

		if (options.method === 'POST') {
			options.headers['Content-Type'] = 'application/json';
			options.headers['Content-Length'] = Buffer.byteLength(options.data);
		}

		return new Promise( (resolve, reject) => {
			const req = protocol.request(options, (res) => {
				let data = '';

				res.setEncoding('utf8');

				res.on('data', (chunk) => {
					data += chunk;
				});

				res.on('end', () => {
					resolve(data);
				});
			});

			req.on('error', (e) => {
				reject(e);
			});

			if (options.data) {
				req.write(options.data);
			}

			req.end();
		});
	},

	get(options, cb) {
		options.method = 'GET';

		return this._request(options, cb);
	},

	post(options, cb) {
		options.method = 'POST';

		options.data = options.data || {};
		options.data = JSON.stringify(options.data);

		return this._request(options, cb);
	}
};

module.exports = request;
