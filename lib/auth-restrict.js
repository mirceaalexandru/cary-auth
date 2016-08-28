'use strict'

module.exports.register = function (server, options, done) {
  var seneca = server.seneca
  var tokenkey = options.tokenkey || 'crontor-login'

  function set_token (msg, done) {
    var token = msg.token

    var session = {}
    session[tokenkey] = token
    this.fixedargs.req$.cookieAuth.set(session)

    done(null, {token: token})
  }

  function get_token (msg, done) {
    if (msg.req$ && msg.req$.seneca && msg.req$.seneca.login) {
      return done(null, {token: msg.req$.seneca.login.id})
    }
    done()
  }

  function init() {
    var opts = {
      password: options.password || 'secret',
      cookie: tokenkey,
      isSecure: options.isSecure || false,
      validateFunc: function (req, session, callback) {
        req.seneca.act('role: auth, do: validateToken', {token: session[tokenkey]}, function (err) {
          if (err) {
            return callback(null, false)
          }
          else {
            callback(null, true)
          }
        })
      }
    }

    server.auth.strategy('session', 'cookie', opts)
  }

  init()

  seneca.add({role: 'auth', set: 'token'}, set_token)
  seneca.add({role: 'auth', get: 'token'}, get_token)

  done()
}
