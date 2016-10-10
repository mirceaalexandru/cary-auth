'use strict';

exports.register = function (server, options, next) {
	server.register([
		{
			register: require('./lib/session')
		},
		{
			register: require('./api/users')
		},
		{
			register: require('./api/login')
		},
		{
			register: require('./api/logout')
		},
		{
			register: require('./api/signup')
		}
	], next);
};

exports.register.attributes = {
	pkg: require('./package.json')
};
