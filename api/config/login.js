'use strict';

const Joi = require('joi');

var description = 'Login user.' +
	'<br>' +
	'<br> ' +
	'Usage: <br>' +
	'<i>curl -i -X POST -H "Content-Type: application/json" -d \'{"username":"admin", "password":"123123"}\' http://localhost:9090/login</i>' +
	'<br>';

var validate = {
	payload: {
		username: Joi.string().token().lowercase().required(),
		password: Joi.string().min(8).required()
	},
};

var response = {
	failAction: 'log',
	status: {
		200: Joi.object({
			user: Joi.object({
				_id: Joi.string().required(),
				username: Joi.string().required(),
				email: Joi.string().required(),
				firstName: Joi.string(),
				lastName: Joi.string()
			})
		}),
		400: Joi.object({
			statusCode: Joi.number().required(),
			error: Joi.string().required(),
			message: Joi.string().required()
		})
	}
}

module.exports.login = {
	validate: validate,
	description: description,
	response: response
};
