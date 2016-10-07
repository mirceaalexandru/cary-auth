'use strict';

const Boom = require('boom');
const UserModel = require('./../models/user');

class User {

	constructor(server) {
		this._server = server;
	}

	getUser(request, reply) {
		var userId = request.params.id

		UserModel.findOne({
			_id: userId
		}, (err, user) => {
			if (err) {
				return reply(err);
			}

			if (!user) {
				return reply(Boom.notFound('Document not found.'));
			}

			reply(user);
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

			reply(user);
		});
	}

	findOne(query, done) {
		UserModel.findOne(
			this._server.plugins.db.instance,
			query,
			done);
	}

	updateUser(request, reply) {

		const id = request.params.id;
		const update = {
			$set: {
				isActive: request.payload.isActive,
				username: request.payload.username,
				email: request.payload.email
			}
		};
	}

	findByCredentials(username, password, done) {
		this.findOne({
			username: username,
			password: password
		},
		done)
	}
}

module.exports = User;
