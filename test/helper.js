'use strict'

const Config = {};

// Our hapi server
const Hapi = require('hapi');

const Server = new Hapi.Server();
const port = 9091;

function init(done) {
	Server.connection({port: port});

	Server.register([
			{
				register: require('hapi-auth-cookie')
			},
			{
				register: require('bell')
			},
			require('./db'),
			require('./../index'),
		],

		function (err) {
			endIfErr(err);

			const cache = Server.cache({segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000});
			Server.app.cache = cache;

			Server.auth.strategy('session', 'cookie', true, {
				password: 'password-should-be-32-characters',
				isSecure: false,
				validateFunc: function (request, session, callback) {
					cache.get(session.sid, (err, cached) => {
						if (err) {
							return callback(err, false);
						}

						if (cached) {
							return callback(null, true, cached.account);
						}

						var Session = Server.plugins.session.instance;
						Session.get(session.sid, (err, data) => {
							if (err) {
								return callback(err, false);
							}

							if (data) {
								cache.set(session.sid, {account: data})
								return callback(null, true, data);
							}

							return callback(null, false);
						})
					});
				}
			});

			Server.start(endIfErr);
			done(null, Server);
		});

	function endIfErr(err) {
		if (err) {
			console.error(err);
			process.exit(1);
		}
	};
}

module.exports.init = init;
