'use strict';

const Joi = require('joi')
const Service = require('./../lib/service')

exports.register = function (server, options, next) {
  // logout
  server.route({
    method: 'POST',
    path: '/auth/logout',
    config: {
      auth: 'session',
      description: 'Logout current loginned user',
      tags: ['auth', 'wip', 'api'],
    },
    handler: function (request, reply) {
      reply({ok: true});
    }
  })

  // login
  server.route({
    method: 'POST',
    path: '/auth/login',
    config: {
      description: 'Login user',
      tags: ['auth', 'wip', 'api'],
      validate: {
        payload: {
          nick: Joi.string().min(3).max(30).required(),
          password: Joi.string().min(6).max(30).required()
        }
      },
      response: {
        status: {
          200: Joi.object().keys({
            user: Joi.object().keys({
              id: Joi.string().min(3).max(50).required(),
              firstName: Joi.string().min(3).max(30).required(),
              lastName: Joi.string().min(3).max(30).required(),
              email: Joi.string().email().required(),
              nick: Joi.string().min(3).max(30).required(),
              password: Joi.string().min(6).max(30).required()
            })
          }),
          500: Joi.object().keys({
            error: Joi.string().max(10).required(),
            message: Joi.string().required()
          }),
          400: Joi.object().keys({
            error: Joi.string().required(),
            message: Joi.string().required()
          }),
          401: Joi.object().keys()
        }
      }
    },
    handler: function (request, reply) {
      request.seneca.act('role: auth, cmd: login', request.payload, function (err, data) {
        reply({ok: true});
      })
    }
  })

  // register
  server.route({
    method: 'POST',
    path: '/auth/register',
    config: {
      description: 'Register and automatically log in a new user',
      tags: ['auth', 'wip', 'api'],
      validate: {
        payload: Joi.object().keys({
          firstName: Joi.string().min(3).max(30).required(),
          lastName: Joi.string().min(3).max(30).required(),
          email: Joi.string().email().required(),
          nick: Joi.string().min(3).max(30).required(),
          password: Joi.string().min(6).max(30).required()
        }),
        options: {
          allowUnknown: true
        }
      },
      response: {
        status: {
          200: Joi.object().keys({
            id: Joi.string().min(3).max(50).required(),
            firstName: Joi.string().min(3).max(30).required(),
            lastName: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            nick: Joi.string().min(3).max(30).required(),
            password: Joi.string().min(6).max(30).required()
          }),
          500: Joi.object().keys({
            error_code: Joi.string().max(10).required(),
            message: Joi.string().required()
          }),
        },
        options: {
          allowUnknown: true
        }
      }
    },
    handler: function (request, reply) {
      request.seneca.act('role: auth, cmd: register', request.payload, function (err, data) {
        reply(data);
      })
    }
  })

  // user
  server.route({
    method: 'POST',
    path: '/auth/user',
    config: {
      description: 'Get data for current logged-in user',
      tags: ['auth', 'wip', 'api']
    },
    handler: function (request, reply) {
      reply({ok: true});
    }
  })


  next();
};

exports.register.attributes = {
  pkg: require('./../package.json')
};
