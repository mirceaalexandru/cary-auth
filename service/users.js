'use strict';

const Boom = require('boom');
const Bcrypt = require('bcrypt');
const UserModel = require('./../models/user');

class User {

	constructor(server) {
		this._server = server;
	}

	getUser(request, reply) {
		this.getUserImpl(request.params.id, function (err, user) {
			if (err) {
				return reply(err);
			}

			reply(user);
		});
	}

	getCurrentUser(request, reply) {
		var userId = request.auth.credentials.userId;
		this.getUserImpl(userId, function (err, user) {
			if (err) {
				return reply(err);
			}

			reply(user);
		});
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

				delete user.password;
				delete user.salt;
				done(null, {user: user});
			});
	}

	createUser(request, reply) {
		this.hashPwd(request.payload, function () {
			UserModel.create(request.server.plugins.db.instance, request.payload, (err, user) => {
				if (err) {
					return reply(err);
				}

				delete user.password;
				delete user.salt;
				reply({user: user});
			});
		});
	}

	hashPwd(user, done) {
		Bcrypt.genSalt(10, function (err, salt) {
			if (err) {
				return done(err);
			}
			user.salt = user.salt || salt;

			Bcrypt.hash(user.password, user.salt, function (err, pwd) {
				if (err) {
					return done(err);
				}

				user.password = pwd;
				done();
			});
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
			err => {
				if (err) {
					return reply(err);
				}

				context.getUser(request, reply);
			});
	}

	resetPassword(request, reply) {
		this.doChangeUserPassword(request.pre.user, request.payload.password, reply);
	}

	changePassword(request, reply) {
		var userId = request.params.id;
		var password = request.payload.password;

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

				this.doChangeUserPassword(user, password, reply);
			});
	}

	doChangeUserPassword(user, password, reply) {
		let context = this;
		let userId = user._id;
		delete user._id;
		user.password = password;

		this.hashPwd(user, function () {
			UserModel.update(
				context._server.plugins.db.instance,
				{_id: userId},
				user,
				err => {
					if (err) {
						return reply(err);
					}

					reply({});
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
				};

				context.hashPwd(match, function () {
					if (match.password === user.password) {
						delete user.password;
						delete user.salt;
						return done(err, user);
					} else {
						return done();
					}
				})
			})
	}
}

module.exports = User;
