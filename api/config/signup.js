'use strict';

const Joi = require('joi');

var description = 'Signup user.' +
	'<br>' +
	'<br> ' +
	'Usage: <br>' +
	'<i>curl -i -X POST -H "Content-Type: application/json" -d \'{"email": "xxxx@cutu.citu1", "password": "qweqweqweqwe1", "username": "sasdasdasd", "firstName": "malex", "lastName": "malex"}\' http://localhost:9090/signup</i>' +
	'<br> ';

var validate = {
	payload: {
		username: Joi.string().token().lowercase().required(),
		password: Joi.string().min(8).required(),
		email: Joi.string().email().lowercase().required(),
		firstName: Joi.string().min(1).required(),
		lastName: Joi.string().min(1).required()
	}
};

var response = {
	failAction: 'log',
	status: {
		200: Joi.object({
			user: Joi.object({
				_id: Joi.string().required(),
				username: Joi.string().required(),
				email: Joi.string().required(),
				firstName: Joi.string().required(),
				lastName: Joi.string().required()
			})
		}),
		409: Joi.object({
			statusCode: Joi.number().required(),
			error: Joi.string().required(),
			message: Joi.string().required()
		})
	}
}

module.exports.signup = {
	validate: validate,
	description: description,
	response: response
};
