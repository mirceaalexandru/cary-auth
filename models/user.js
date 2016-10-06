'use strict';

var UsersColl = 'users';

function create(DB, user, done) {
	DB.insert(UsersColl, user, done);
}

function findOne(DB, cond, done) {
	DB.findOne(UsersColl, cond, done);
}

exports.create = create;
exports.findOne = findOne;
