'use strict';

const Boom = require('boom');
const UserModel = require('./../models/user');
const Bcrypt = require('bcrypt');

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
		this.hashPwd(request.payload, function () {
			UserModel.create(request.server.plugins.db.instance, request.payload, (err, user) => {
				if (err) {
					return reply(err);
				}

				reply({user: user});
			});
		});
	}

	hashPwd (user, done) {
		Bcrypt.genSalt(10, function (err, salt) {
			user.salt = user.salt || salt;

			Bcrypt.hash(user.password, user.salt, function (err, pwd) {
				user.password = pwd;
				done();
			})
		})
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

				this.hashPwd (user, function() {
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
			});
	}

	findByCredentials(username, password, done) {
		var context = this;
		this.findOne(
			{
				username: username
			},
			function (err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done();
				}

				var match = {
					password: password,
					salt: user.salt
				}

				context.hashPwd (match, function() {
					if (match.password === user.password) {
						delete user.password;
						delete user.salt;
						return done(err, user)
					} else {
						return done();
					}
				})
			})
	}
}

module.exports = User;
