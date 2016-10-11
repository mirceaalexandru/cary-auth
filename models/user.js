'use strict';

var UsersColl = 'users';

function create(DB, user, done) {
	DB.insert(UsersColl, user, done);
}

function findOne(DB, cond, done) {
	DB.findOne(UsersColl, cond, done);
}

function update(DB, cond, setValues, done) {
	DB.update(UsersColl, cond, setValues, done);
}

exports.create = create;
exports.findOne = findOne;
exports.update = update;
