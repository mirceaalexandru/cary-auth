'use strict';

const Joi = require('joi');

var description = 'Logout user.' +
	'<br>' +
	'<br> ' +
	'Usage: <br>' +
	'<i>curl -i -X POST http://localhost:9090/logout</i>' +
	'<br> ' +
	'<br> ' +
	'Response example: ' +
	'<ul>' +
	'<li>In case of invalidation session: <i>{"statusCode":404,"error":"Not Found","message":"Document not found."}</i>' +
	'<li>In case of valid session: <i>{"message":"Success."}</i>' +
	'</ul>';


var response = {
	failAction: 'log',
	status: {
		200: Joi.object({
			message: Joi.string().required()
		}),
		404: Joi.object({
			statusCode: Joi.number().required(),
			error: Joi.string().required(),
			message: Joi.string().required()
		})
	}
}

module.exports.logout = {
	description: description,
	response: response
};
