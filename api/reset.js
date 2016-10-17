'use strict';

const LoginService = require('./../service/login');
const UserService = require('./../service/users');
const Boom = require('boom');

const APIConfig = require('./config/reset');

const internals = {};

internals.applyRoutes = function (server, next) {
	var Login = new LoginService(server);
	var User = new UserService(server);

	server.route({
		method: 'POST',
		path: '/auth/forgot',
		config: {
			description: APIConfig.reset.description,
			tags: ['auth', 'user'],
			auth: false,
			validate: APIConfig.reset.validate,
			response: APIConfig.reset.response,
			pre: [
				{
					assign: 'user',
					method: function (request, reply) {

						const email = request.payload.email;
						User.findOne({email: email}, (err, user) => {
							if (err) {
								return reply(err);
							}

							if (!user) {
							return reply(Boom.notFound('Email not found.'))
						}

						reply(user);
					});
					}
				}
			]
		},
		handler: function (request, reply) {
			Login.forgotPassword(request, reply);
		}
	});

	next();
};


exports.register = function (server, options, next) {
	server.dependency(['hapi-auth-cookie'], internals.applyRoutes);
	next();
};


exports.register.attributes = {
	name: 'login-reset'
};
