'use strict'

function init(done) {
	// Our hapi server
	const Hapi = require('hapi');
	const Server = new Hapi.Server();

	Server.connection();

	Server.register([
			{
				register: require('hapi-auth-cookie')
			},
			{
				register: require('bell')
			},
			require('./db'),
			require('./../index'),
		],

		function (err) {
			endIfErr(err);

			Server.start(endIfErr);
			done(null, Server);
		});

	function endIfErr(err) {
		if (err) {
			console.error(err);
			process.exit(1);
		}
	};
}

module.exports.init = init;
