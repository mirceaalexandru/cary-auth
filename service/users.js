'use strict';

const Boom = require('boom');
const UserModel = require('./../models/user');

class User {

	constructor(server) {
		this._server = server;
	}

	getUser(request, reply) {
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

				reply({user: user});
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
		UserModel.update(
			request.server.plugins.db.instance,
			request.payload,
			(err, user) => {
				if (err) {
					return reply(err);
				}

				reply({user: user});
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
