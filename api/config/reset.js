'use strict';

const Joi = require('joi');

var description = 'Forgot password - it will send an email for reset password.' +
	'<br>' +
	'<br> ' +
	'Usage: <br>' +
	'<i>curl -i -X POST -H "Content-Type: application/json" -d \'{"email":"some@some.com"}\' http://localhost:9090/auth/forgot</i>' +
	'<br>';

var validate = {
	payload: {
		email: Joi.string().email().required()
	},
};

var response = {
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

module.exports.reset = {
	validate: validate,
	description: description,
	response: response
};
