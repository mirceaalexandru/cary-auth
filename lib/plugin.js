'use strict';

const Joi = require('joi')
const Service = require('./service')

exports.register = function (server, options, next) {
  server.route({
    method: 'POST',
    path: '/auth/logout',
    config: {
      description: 'Logout current loginned user',
      tags: ['auth', 'wip', 'api'],
    },
    handler: function (request, reply) {
      reply({ok: true});
    }
  })

  server.route({
    method: 'POST',
    path: '/auth/register',
    config: {
      description: 'Register and automatically log in a new user',
      tags: ['auth', 'wip', 'api'],
      validate: {
        payload: {
          firstName: Joi.string().min(3).max(30).required(),
          lastName: Joi.string().min(3).max(30).required(),
          email: Joi.string().email().required(),
          username: Joi.string().min(3).max(30).required(),
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
              username: Joi.string().min(3).max(30).required(),
              password: Joi.string().min(6).max(30).required()
            })
          }),
          500: Joi.object().keys({
            error_code: Joi.string().max(10).required(),
            message: Joi.string().required()
          })
        }
      }
    },
    handler: function (request, reply) {
      Service.register(request.payload, function (err, data) {
        reply({ok: true});
      })
    }
  })

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
