'use strict';

const Boom = require('boom');
const UserModel = require('./../models/user');

class User {

	constructor(server) {
		this._server = server;
	}

	getUser(request, reply) {
		this.getUserImpl(request.params.id, function (err, user) {
			if (err) {
				return reply(err)
			}

			reply({user: user});
		})
	}

	getCurrentUser(request, reply) {
		var userId = request.auth.credentials.userId;
		this.getUserImpl(userId, function (err, user) {
			if (err) {
				return reply(err)
			}

			reply({user: user});
		})
	}

	getUserImpl(userId, done) {
		UserModel.findOne(
			this._server.plugins.db.instance,
			{
				_id: userId
			}, (err, user) => {
				if (err) {
					return done(err);
				}

				if (!user) {
					return done(Boom.notFound('Document not found.'));
				}

				done(null, {user: user});
			});
	}

	createUser(request, reply) {
		const username = request.payload.username;
		const password = request.payload.password;
		const email = request.payload.email;

		UserModel.create(request.server.plugins.db.instance, {
			username: username,
			password: password,
			email: email
		}, (err, user) => {
			if (err) {
				return reply(err);
			}

			reply({user: user});
		});
	}

	findOne(query, done) {
		UserModel.findOne(
			this._server.plugins.db.instance,
			query,
			done);
	}

	updateUser(request, reply) {
		var context = this;


		UserModel.update(
			request.server.plugins.db.instance,
			{_id: request.params.id},
			request.payload,
			(err, user) => {
				if (err) {
					return reply(err);
				}

				context.getUser(request, reply);
			});
	}

	changePassword(request, reply) {
		var userId = request.params.id

		UserModel.findOne(
			request.server.plugins.db.instance,
			{
				_id: userId
			}, (err, user) => {
				if (err) {
					return reply(err);
				}

				if (!user) {
					return reply(Boom.notFound('Document not found.'));
				}

				delete user._id;
				user.password = request.payload.password

				UserModel.update(
					request.server.plugins.db.instance,
					{_id: request.params.id},
					user,
					(err) => {
						if (err) {
							return reply(err);
						}

						reply({});
					});
			});
	}

	findByCredentials(username, password, done) {
		this.findOne(
			{
				username: username,
				password: password
			},
			done)
	}
}

module.exports = User;
