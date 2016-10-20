'use strict';

exports.register = function (server, options, next) {
	const cache = server.cache({segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000});
	server.app.cache = cache;

	let cookieSecret = server.settings.app.cookieSecret || 'password-should-be-32-characters';
	server.auth.strategy('session', 'cookie', true, {
		password: cookieSecret,
		isSecure: false,
		validateFunc: function (request, session, callback) {
			cache.get(session.sid, (err, cached) => {
				if (err) {
					return callback(err, false);
				}

				if (cached) {
					return callback(null, true, cached.account);
				}

				var Session = server.plugins.session.instance;
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

	server.register([
		{
			register: require('./lib/session')
		},
		{
			register: require('./api/users')
		},
		{
			register: require('./api/login')
		},
		{
			register: require('./api/logout')
		},
		{
			register: require('./api/reset')
		},
		{
			register: require('./api/signup')
		}
	], next);
};

exports.register.attributes = {
	pkg: require('./package.json')
};
