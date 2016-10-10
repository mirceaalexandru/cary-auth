'use strict';

const SessionService = require('./../service/session');

exports.register = function (server, options, next) {
	var Session = new SessionService(server);

	server.expose('instance', Session);
	return next();
};

exports.register.attributes = {
	name: 'session'
};
