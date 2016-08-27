'use strict';

function register(user, done) {
  return done(null, user);
}

exports.register = register;
