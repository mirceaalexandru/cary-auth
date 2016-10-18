'use strict';

const _ = require('lodash');
const Boom = require('boom');

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
		request.server.plugins['utils-token'].save({userId: user._id}, (err, token) => {
			data.token = token;
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
		})
	}
}

module.exports = Login;
