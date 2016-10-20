'use strict';

const Boom = require('boom');
const UserService = require('./../service/users');
const APIConfig = require('./config/signup');

const internals = {};

internals.applyRoutes = function (server, next) {

	let User = new UserService(server);

	// signup user
	server.route({
		method: 'POST',
		path: '/signup',
		config: {
			description: APIConfig.signup.description,
			tags: ['auth', 'user'],
			auth: false,
			response: APIConfig.signup.response,
			validate: APIConfig.signup.validate,
			pre: [
				{
					assign: 'usernameCheck',
					method: function (request, reply) {
						const conditions = {
							username: request.payload.username
						};

						User.findOne(conditions, (err, user) => {
							if (err) {
								return reply(err);
							}

							if (user) {
								return reply(Boom.conflict('Username already in use.'));
							}

							reply(true);
						});
					}
				},
				{
					assign: 'emailCheck',
					method: function (request, reply) {
						const conditions = {
							email: request.payload.email
						};

						User.findOne(conditions, (err, user) => {
							if (err) {
								return reply(err);
							}

							if (user) {
								return reply(Boom.conflict('Email already in use.'));
							}

							reply(true);
						});
					}
				}
			]
		},
		handler: function (request, reply) {
			User.createUser(request, reply);
		}
	});

	next();
};

exports.register = function (server, options, next) {
	server.dependency(['hapi-auth-cookie'], internals.applyRoutes);
	next();
};

exports.register.attributes = {
	name: 'signup'
};
