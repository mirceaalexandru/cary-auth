'use strict';

module.exports = function (options) {

  var seneca = this

  function register(user, done) {
    return done(null, user);
  }

  function login(data, done) {
    this.act('role: user, cmd: login', data, function (err, response) {
      return done(null, response);
    })
  }

  function register(data, done) {
    this.act('role: user, cmd: register', data, function (err, response) {
      if (err){
        return done(err)
      }

      if (!response.ok) {
        return done(response.why)
      }
      return done(null, response.user.data$(false));
    })
  }

  seneca.add('role: auth, cmd: login', login)
  seneca.add('role: auth, cmd: register', register)
}
