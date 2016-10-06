'use strict';

const Session = null;
const User = null;

function login(request, reply) {

	request.cookieAuth.set({ sid: request.pre.session.id })

	reply({
		user: request.pre.user
	});
}

function forgotPassword(request, reply) {

	const mailer = request.server.plugins.mailer;

	Async.auto({
		keyHash: function (done) {

			Session.generateKeyHash(done);
		},
		user: ['keyHash', function (results, done) {

			const id = request.pre.user._id.toString();
			const update = {
				$set: {
					resetPassword: {
						token: results.keyHash.hash,
						expires: Date.now() + 10000000
					}
				}
			};

			User.findByIdAndUpdate(id, update, done);
		}],
		email: ['user', function (results, done) {

			const emailOptions = {
				subject: 'Reset your ' + Config.get('/projectName') + ' password',
				to: request.payload.email
			};
			const template = 'forgot-password';
			const context = {
				key: results.keyHash.key
			};

			mailer.sendEmail(emailOptions, template, context, done);
		}]
	}, (err, results) => {

		if (err) {
			return reply(err);
		}

		reply({message: 'Success.'});
	});
}

function resetPassword(request, reply) {
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

exports.resetPassword = resetPassword;
exports.forgotPassword = forgotPassword;
exports.login = login;
