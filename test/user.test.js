'use strict'

var Code = require('code');
var expect = Code.expect;

const Lab = require('lab')
const lab = exports.lab = Lab.script()
const suite = lab.suite
const test = lab.test
const before = lab.before

const Helper = require('./helper')

suite('User suite tests', () => {
	let server
	let cookie
	let user = {username: 'user1', firstName: 'user1', lastName: 'user1', email: 'user1@example.com', password: '123123123aZ'}
	let userPwd = '123123123aZ';

	before({}, function (done) {
		Helper.init(function (err, srv) {
			expect(err).to.not.exist();

			server = srv
			done()
		})
	})

	test('signup incomplete', (done) => {
		let url = '/signup'
		server.inject({
			url: url,
			method: 'POST',
			payload: {email: 'admin@concorda.com', password: 'some_password'}
		}, function (res) {
			expect(res.statusCode).to.be.equal(400);
			expect(JSON.parse(res.payload)).to.exist();
			expect(JSON.parse(res.payload).error).to.be.equal('Bad Request');

			done()
		})
	})

	test('signup complete', (done) => {
		let url = '/signup'
		server.inject({
			url: url,
			method: 'POST',
			payload: user
		}, function (res) {
			expect(res.statusCode).to.be.equal(200);
			var payload = JSON.parse(res.payload);
			expect(payload.user).to.exist();
			expect(payload.user.username).to.be.equal(user.username);
			expect(payload.user.firstName).to.be.equal(user.firstName);
			expect(payload.user.lastName).to.be.equal(user.lastName);
			expect(payload.user.email).to.be.equal(user.email);
			expect(payload.user.password).to.not.exist();
			expect(payload.user.salt).to.not.exist();

			done()
		})
	})

	test('incorrect login', (done) => {
		let url = '/login'
		server.inject({
			url: url,
			method: 'POST',
			payload: {password: user.password + 'wrong', username: user.username}
		}, function (res) {
			expect(res.statusCode).to.be.equal(400);

			done()
		})
	})

	test('correct login', (done) => {
		let url = '/login'
		server.inject({
			url: url,
			method: 'POST',
			payload: {password: userPwd, username: user.username}
		}, function (res) {
			expect(res.statusCode).to.be.equal(200);
			var payload = JSON.parse(res.payload);
			expect(payload.user).to.exist();
			expect(payload.user.username).to.be.equal(user.username);
			expect(payload.user.firstName).to.be.equal(user.firstName);
			expect(payload.user.lastName).to.be.equal(user.lastName);
			expect(payload.user.email).to.be.equal(user.email);
			expect(payload.user.password).to.not.exist();
			expect(payload.user.salt).to.not.exist();

			cookie = res.headers['set-cookie'][0]
			cookie = cookie.match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/)[1]
			user = payload.user;
			done()
		})
	})

	test('get user', (done) => {
		let url = '/users/' + user._id
		server.inject({
			url: url,
			method: 'GET',
			headers: { cookie: 'sid=' + cookie }
		}, function (res) {
			expect(res.statusCode).to.be.equal(200);
			var payload = JSON.parse(res.payload);
			expect(payload.user).to.exist();
			expect(payload.user.username).to.be.equal(user.username);
			expect(payload.user.firstName).to.be.equal(user.firstName);
			expect(payload.user.lastName).to.be.equal(user.lastName);
			expect(payload.user.email).to.be.equal(user.email);
			expect(payload.user.password).to.not.exist();
			expect(payload.user.salt).to.not.exist();

			done()
		})
	})

	test('get current logged in user', (done) => {
		let url = '/users/my'
		server.inject({
			url: url,
			method: 'GET',
			headers: { cookie: 'sid=' + cookie }
		}, function (res) {
			expect(res.statusCode).to.be.equal(200);
			var payload = JSON.parse(res.payload);
			expect(payload.user).to.exist();
			expect(payload.user.username).to.be.equal(user.username);
			expect(payload.user.firstName).to.be.equal(user.firstName);
			expect(payload.user.lastName).to.be.equal(user.lastName);
			expect(payload.user.email).to.be.equal(user.email);
			expect(payload.user.password).to.not.exist();
			expect(payload.user.salt).to.not.exist();

			done()
		})
	})

	test('change password', (done) => {
		let url = '/users/' + user._id + '/password'
		server.inject({
			url: url,
			method: 'PUT',
			headers: { cookie: 'sid=' + cookie },
			payload: {password: 'xxxxxxxx'}
		}, function (res) {
			expect(res.statusCode).to.be.equal(200);

			done()
		})
	})

	test('cannot login with old password', (done) => {
		let url = '/login'
		server.inject({
			url: url,
			method: 'POST',
			payload: {password: userPwd, username: user.username}
		}, function (res) {
			expect(res.statusCode).to.be.equal(400	);

			done()
		})
	})

	test('can login with new password', (done) => {
		let url = '/login'
		server.inject({
			url: url,
			method: 'POST',
			payload: {password: 'xxxxxxxx', username: user.username}
		}, function (res) {
			expect(res.statusCode).to.be.equal(200);
			var payload = JSON.parse(res.payload);
			expect(payload.user).to.exist();
			expect(payload.user.username).to.be.equal(user.username);
			expect(payload.user.firstName).to.be.equal(user.firstName);
			expect(payload.user.lastName).to.be.equal(user.lastName);
			expect(payload.user.email).to.be.equal(user.email);
			expect(payload.user.password).to.not.exist();
			expect(payload.user.salt).to.not.exist();

			cookie = res.headers['set-cookie'][0]
			cookie = cookie.match(/(?:[^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)\s*=\s*(?:([^\x00-\x20\"\,\;\\\x7F]*))/)[1]
			user = payload.user;
			done()
		})
	})

	test('logout', (done) => {
		let url = '/logout'
		server.inject({
			url: url,
			method: 'POST',
			headers: { cookie: 'sid=' + cookie }
		}, function (res) {
			expect(res.statusCode).to.be.equal(200);

			done()
		})
	})

	test('change password after logout', (done) => {
		let url = '/users/' + user._id + '/password'
		server.inject({
			url: url,
			method: 'PUT',
			headers: { cookie: 'sid=' + cookie },
			payload: {password: 'xxxxxxxx'}
		}, function (res) {
			expect(res.statusCode).to.be.equal(401);

			done()
		})
	})
})
