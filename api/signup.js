'use strict';

const Boom = require('boom');
const Joi = require('joi');
const UserService = require('./../service/users');

const tags = ['auth', 'user'];
const internals = {};

internals.applyRoutes = function (server, next) {

	var User = new UserService(server);

	// signup user
	server.route({
		method: 'POST',
		path: '/users',
		config: {
			description: 'Create user',
			tags: tags,
			auth: false,
			validate: {
				payload: {
					username: Joi.string().token().lowercase().required(),
					password: Joi.string().required(),
					email: Joi.string().email().lowercase().required()
				}
			},
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
		handler: User.createUser
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
