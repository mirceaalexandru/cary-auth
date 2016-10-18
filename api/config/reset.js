'use strict';

const Joi = require('joi');

var descriptionForgot = 'Forgot password - it will send an email for reset password.' +
	'<br>' +
	'<br> ' +
	'Usage: <br>' +
	'<i>curl -i -X POST -H "Content-Type: application/json" -d \'{"email":"some@some.com"}\' http://localhost:9090/auth/forgot</i>' +
	'<br>' +
	'<br> <b>Note:</b> the email sent to user will contain a reset url like this:' +
	'<br><strong>http://localhost:9090/#/reset/{token}</strong>' +
	'<br>This path should be implemented on client side for asking the user for new password' +
	'<br>';

var validateForgot = {
	payload: {
		email: Joi.string().email().required()
	},
};

var responseForgot = {
	failAction: 'log',
	status: {
		200: Joi.object(),
		400: Joi.object({
			statusCode: Joi.number().required(),
			error: Joi.string().required(),
			message: Joi.string().required()
		}),
		404: Joi.object({
			statusCode: Joi.number().required(),
			error: Joi.string().required(),
			message: Joi.string().required()
		})
	}
}

var descriptionReset = 'Reset password based on a reset token.' +
	'<br>' +
	'<br> ' +
	'Usage: <br>' +
	'<i>curl -i -X POST -H "Content-Type: application/json" -d \'{"password":"123123123", "token": "123123"}\' http://localhost:9090/auth/reset</i>' +
	'<br>';

var validateReset = {
	payload: {
		token: Joi.string().required(),
		password: Joi.string().min(8).required()
	}
};

var responseReset = {
	failAction: 'log',
	status: {
		200: Joi.object(),
		400: Joi.object({
			statusCode: Joi.number().required(),
			error: Joi.string().required(),
			message: Joi.string().required()
		}),
		404: Joi.object({
			statusCode: Joi.number().required(),
			error: Joi.string().required(),
			message: Joi.string().required()
		})
	}
}

module.exports.forgot = {
	validate: validateForgot,
	description: descriptionForgot,
	response: responseForgot
};

module.exports.reset = {
	validate: validateReset,
	description: descriptionReset,
	response: responseReset
};
