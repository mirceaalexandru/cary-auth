'use strict';

const Service = require('./service')
const API = require('./../api/api')
const Restrict = require('./auth-restrict')
const User = require('seneca-user')

exports.register = function (server, options, next) {
  var seneca = server.seneca

  seneca.use(Service)
  seneca.use(User)

  Restrict.register(server, options, function (err) {
    API.register(server, options, next)
  })
};

exports.register.attributes = {
  pkg: require('./../package.json')
};
