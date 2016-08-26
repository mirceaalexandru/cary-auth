'use strict'

// Our hapi server bits
const Hapi = require('hapi')

const Chairo = require('chairo')

// out plugins
const CrontorAuth = require('./lib/plugin')

function endIfErr (err) {
	if (err) {
		console.error(err)
		process.exit(1)
	}
}

var server = new Hapi.Server()
server.connection({port: 3000})

var plugins = [
	{register: Chairo},
	CrontorAuth
]

server.register(plugins, function (err) {
	endIfErr(err)

	server.start(endIfErr)
})
