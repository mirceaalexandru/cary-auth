'use strict';
const Boom = require('boom');
const APIConfig = require('./config/logout');
const SessionService = require('./../service/session');

const internals = {};

internals.applyRoutes = function (server, next) {
	var Session = new SessionService(server);

	const defaultServerConnection = server.select('default');
	defaultServerConnection.route({
		method: 'POST',
		path: '/logout',
		config: {
			description: APIConfig.logout.description,
			tags: ['auth', 'doc'],
			response: APIConfig.logout.response
		},
		handler: function (request, reply) {
			const credentials = request.auth.credentials || {_id: ""};
			const session = credentials._id.toString();

			if (!session) {
				return reply(Boom.notFound('Document not found.'));
			}

			Session.findByIdAndDelete(session, (err, sessionDoc) => {
				if (err) {
					return reply(err);
				}

				request.server.app.cache.drop(session, () => {
					if (!sessionDoc) {
						return reply(Boom.notFound('Document not found.'));
					}

					reply({message: 'Success.'});
				})
			});
		}
	});

	next();
};

exports.register = function (server, options, next) {
	server.dependency(['hapi-auth-cookie'], internals.applyRoutes);
	next();
};

exports.register.attributes = {
	name: 'logout'
};
