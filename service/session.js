'use strict';

const SessionModel = require('./../models/session');

class Session {
	constructor(server) {
		this._server = server;
	}

	create(userId, reply) {
		SessionModel.create({
			userId: userId
		}, (err, session) => {
			if (err) {
				return reply(err);
			}

			reply(session);
		});
	}

	get(sessionId, done) {
		SessionModel.findOne({
			_id: new ObjectID(sessionId)
		}, (err, session) => {
			if (err) {
				return done(err);
			}

			done(null, session);
		});
	}
}

exports.Session = Session;
