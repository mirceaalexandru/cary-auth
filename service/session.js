'use strict';

const SessionModel = require('./../models/session');

class Session {
	constructor(server) {
		this._server = server;
	}

	create(userId, reply) {
		SessionModel.create(
			this._server.plugins.db.instance,
			{
				userId: userId
			}, (err, session) => {
				if (err) {
					return reply(err);
				}

				reply(session);
			});
	}

	get(sessionId, done) {
		SessionModel.findOne(
			this._server.plugins.db.instance,
			{
				_id: sessionId
			}, done);
	}

	findByIdAndDelete(sessionId, done) {
		SessionModel.findByIdAndDelete(
			this._server.plugins.db.instance,
			{
				_id: sessionId
			}, done);
	}
}

module.exports = Session;
