'use strict';

const Boom = require('boom');

const LoginService = require('./../service/login');
const UserService = require('./../service/users');
const SessionService = require('./../service/session');
const APIConfig = require('./config/login');

const internals = {};

internals.applyRoutes = function (server, next) {

	var Login = new LoginService(server);
	var User = new UserService(server);
	var Session = new SessionService(server);

	server.route({
		method: 'POST',
		path: '/login',
		config: {
			description: APIConfig.login.description,
			tags: ['auth', 'doc'],
			auth: false,
			validate: APIConfig.login.validate,
			response: APIConfig.login.response,
			pre: [
				{
					assign: 'user',
					method: function (request, reply) {

						const username = request.payload.username;
						const password = request.payload.password;

						User.findByCredentials(username, password, (err, user) => {
							if (err) {
								return reply(err);
							}

							reply(user);
						});
					}
				},
				{
					assign: 'validateUser',
					method: function (request, reply) {
						if (request.pre.user) {
							return reply();
						}

						return reply(Boom.badRequest('Username and password combination not found or account is inactive.'));
					}
				},
				{
					assign: 'session',
					method: function (request, reply) {
						Session.create(request.pre.user._id.toString(), (err, session) => {

							if (err) {
								return reply(err);
							}

							return reply(session);
						});
					}
				}
			]
		},
		handler: Login.login
	});

	next();
};


exports.register = function (server, options, next) {
	server.dependency(['hapi-auth-cookie'], internals.applyRoutes);
	next();
};


exports.register.attributes = {
	name: 'login'
};
