'use strict';

const Boom = require('boom');
const Joi = require('joi');
const UserService = require('./../service/users');
const APIConfig = require('./config/users');

const internals = {};

internals.applyRoutes = function (server, next) {

	var User = new UserService(server);

	// get user
	server.route({
		method: 'GET',
		path: '/users/{id}',
		config: {
			description: APIConfig.getUser.description,
			tags: ['user']
		},
		handler: function (request, reply) {
			User.getUser(request, reply);
		}
	});

	// update user
	server.route({
		method: 'PUT',
		path: '/users/{id}',
		config: {
			description: APIConfig.updateUser.description,
			tags: ['user'],
			response: APIConfig.updateUser.response,
			validate: APIConfig.updateUser.validate,
			pre: [
				{
					assign: 'usernameCheck',
					method: function (request, reply) {

						const conditions = {
							username: request.payload.username,
							_id: {$ne: request.params.id}
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
							email: request.payload.email,
							_id: {$ne: request.params.id}
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
			User.updateUser(request, reply);
		}
	});

	//server.route({
	//	method: 'PUT',
	//	path: '/users/{id}/password',
	//	config: {
	//		description: 'Change user password',
	//		tags: tagsWIP,
	//		auth: {
	//			strategy: 'session'
	//		},
	//		validate: {
	//			params: {
	//				id: Joi.string().invalid('000000000000000000000000')
	//			},
	//			payload: {
	//				password: Joi.string().required()
	//			}
	//		},
	//		pre: [
	//			{
	//				assign: 'password',
	//				method: function (request, reply) {
	//
	//					User.generatePasswordHash(request.payload.password, (err, hash) => {
	//						if (err) {
	//							return reply(err);
	//						}
	//
	//						reply(hash);
	//					});
	//				}
	//			}
	//		]
	//	},
	//	handler: User.changePassword
	//});

	next();
};


exports.register = function (server, options, next) {
	server.dependency(['hapi-auth-cookie'], internals.applyRoutes);

	next();
};


exports.register.attributes = {
	name: 'users'
};
