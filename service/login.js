'use strict';

const Boom = require('boom');
const _ = require('lodash');

class Login {
	constructor(server) {
		this._server = server;
	}

	login(request, reply) {
		request.cookieAuth.set({sid: request.pre.session._id})

		reply({
			user: request.pre.user
		});
	}

	forgotPassword(request, reply) {
		const user = request.pre.user;

		let data = _.merge({}, user);
		request.server.plugins['utils-mail'].send({
			template: 'forgot-password',
			data: data,
			subject: 'Reset password',
			to: user.email
		}, function (err) {
			if (err) {
				return reply(Boom.badRequest('Invalid email or key.'));
			}

			reply({})
		});
	}

	resetPassword(request, reply) {
		Async.auto({
			keyMatch: function (done) {

				const key = request.payload.key;
				const token = request.pre.user.resetPassword.token;
				Bcrypt.compare(key, token, done);
			},
			passwordHash: ['keyMatch', function (results, done) {

				if (!results.keyMatch) {
					return reply(Boom.badRequest('Invalid email or key.'));
				}

				User.generatePasswordHash(request.payload.password, done);
			}],
			user: ['passwordHash', function (results, done) {

				const id = request.pre.user._id.toString();
				const update = {
					$set: {
						password: results.passwordHash.hash
					},
					$unset: {
						resetPassword: undefined
					}
				};

				User.findByIdAndUpdate(id, update, done);
			}]
		}, (err, results) => {

			if (err) {
				return reply(err);
			}

			reply({message: 'Success.'});
		});
	}
}

module.exports = Login;
