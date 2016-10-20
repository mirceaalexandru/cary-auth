'use strict';

const Boom = require('boom');
const LoginService = require('./../service/login');
const UserService = require('./../service/users');
const APIConfig = require('./config/reset');

const internals = {};

internals.applyRoutes = function (server, next) {
	let Login = new LoginService(server);
	let User = new UserService(server);

	server.route({
		method: 'POST',
		path: '/auth/forgot',
		config: {
			description: APIConfig.forgot.description,
			tags: ['auth', 'user'],
			auth: false,
			validate: APIConfig.forgot.validate,
			response: APIConfig.forgot.response,
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

	server.route({
		method: 'POST',
		path: '/auth/reset',
		config: {
			description: APIConfig.reset.description,
			tags: ['auth', 'user'],
			auth: false,
			validate: APIConfig.reset.validate,
			response: APIConfig.reset.response,
			pre: [{
				assign: 'user',
				method: function (request, reply) {

					server.plugins['utils-token'].read(request.payload.token, (err, data) => {
						if (err) {
							return reply(err);
						}

						if (!data || !data.userId) {
							return reply(Boom.notFound('Token not found.'));
						}

						const conditions = {
							_id: data.userId
						};

						User.findOne(conditions, (err, user) => {
							if (err) {
								return reply(err);
							}

							if (!user) {
								return reply(Boom.badRequest('User not found.'));
							}

							reply(user);
						});
					})
				}
			}]
		},
		handler: function (request, reply) {
			User.resetPassword(request, reply);
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
