'use strict';

var SessionColl = 'session';

function create(DB, session, done) {
	DB.insert(SessionColl, session, done);
}

function findOne(DB, cond, done) {
	DB.findOne(SessionColl, cond, done);
}

function findByIdAndDelete(DB, cond, done) {
	DB.findByIdAndDelete(SessionColl, cond, done);
}

exports.create = create;
exports.findOne = findOne;
exports.findByIdAndDelete = findByIdAndDelete;
