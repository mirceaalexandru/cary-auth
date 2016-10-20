'use strict';

var Code = require('code');

var expect = Code.expect;
const Lab = require('lab');

const lab = exports.lab = Lab.script();
const suite = lab.suite;
const test = lab.test;
const before = lab.before;

suite('User suite tests', () => {
	let server;
	let user = {username: 'user1', firstName: 'user1', lastName: 'user1', email: 'user1@example.com', password: '123123123aZ'};
	let userPwd = '123123123aZ';

	before({}, done => {
		const Helper = require('./helper');
		Helper.init((err, srv) => {
			expect(err).to.not.exist();

			server = srv;
			done();
		});
	});

	test('signup complete', done => {
		let url = '/signup';
		server.inject({
			url: url,
			method: 'POST',
			payload: user
		}, res => {
			expect(res.statusCode).to.be.equal(200);
			var payload = JSON.parse(res.payload);
			expect(payload.user).to.exist();
			expect(payload.user.username).to.be.equal(user.username);
			expect(payload.user.firstName).to.be.equal(user.firstName);
			expect(payload.user.lastName).to.be.equal(user.lastName);
			expect(payload.user.email).to.be.equal(user.email);
			expect(payload.user.password).to.not.exist();
			expect(payload.user.salt).to.not.exist();

			done();
		});
	});

	test('correct login', done => {
		let url = '/login';
		server.inject({
			url: url,
			method: 'POST',
			payload: {password: userPwd, username: user.username}
		}, res => {
			expect(res.statusCode).to.be.equal(200);
			var payload = JSON.parse(res.payload);
			expect(payload.user).to.exist();
			expect(payload.user.username).to.be.equal(user.username);
			expect(payload.user.firstName).to.be.equal(user.firstName);
			expect(payload.user.lastName).to.be.equal(user.lastName);
			expect(payload.user.email).to.be.equal(user.email);
			expect(payload.user.password).to.not.exist();
			expect(payload.user.salt).to.not.exist();

			user = payload.user;
			done();
		});
	});

	let token = null;
	let info = null;
	let newPassword = '321432543';
	test('forgot password', done => {
		// first I need to load a mock email plugin
		var pluginEmail = {
			register: (server, options, next) => {
				server.expose('send', send);
				next();
			}
		};
		pluginEmail.register.attributes = {
			name: 'utils-mail'
		};

		var pluginToken = {
			register: (server, options, next) => {
				server.expose('save', saveToken);
				server.expose('read', readToken);
				next();
			}
		};
		pluginToken.register.attributes = {
			name: 'utils-token'
		};

		server.register([pluginEmail, pluginToken], err => {
			expect(err).to.not.exist();

			server.inject({
				url: '/auth/forgot',
				method: 'POST',
				payload: {email: user.email}
			}, res => {
				expect(res.statusCode).to.be.equal(200);

				server.inject({
					url: '/auth/reset',
					method: 'POST',
					payload: {token: token, password: newPassword}
				}, res => {
					expect(res.statusCode).to.be.equal(200);

					done();
				});
			});
		});

		function send(input, done) {
			expect(input).to.exist();
			expect(input.data._id).to.exist();
			expect(input.data).to.contains(user);
			token = input.data.token;
			expect(token).to.exist();
			done();
		}

		function saveToken(infoData, done) {
			expect(infoData).to.exist();
			expect(infoData.userId).to.exist();
			info = infoData;
			done(null, '123123123');
		}

		function readToken(tokenData, done) {
			expect(tokenData).to.exist();
			expect(tokenData).to.be.equal(token);
			done(null, info);
		}
	});

	test('cannot login with old password', done => {
		let url = '/login';
		server.inject({
			url: url,
			method: 'POST',
			payload: {password: userPwd, username: user.username}
		}, res => {
			expect(res.statusCode).to.be.equal(400);

			done();
		});
	});

	test('can login with new password', done => {
		let url = '/login';
		server.inject({
			url: url,
			method: 'POST',
			payload: {password: newPassword, username: user.username}
		}, res => {
			expect(res.statusCode).to.be.equal(200);
			var payload = JSON.parse(res.payload);
			expect(payload.user).to.exist();
			expect(payload.user.username).to.be.equal(user.username);
			expect(payload.user.firstName).to.be.equal(user.firstName);
			expect(payload.user.lastName).to.be.equal(user.lastName);
			expect(payload.user.email).to.be.equal(user.email);
			expect(payload.user.password).to.not.exist();
			expect(payload.user.salt).to.not.exist();

			done();
		});
	});
})
