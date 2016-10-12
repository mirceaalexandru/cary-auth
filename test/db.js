'use strict';

var _ = require('lodash');
var uuid = require('node-uuid');

exports.register = function (server, options, next) {
	var data = {};

	function getCollection(coll){
		data[coll] = data[coll] || {};
		return data[coll];
	}

	var internals = {
		insert: function (coll, doc, done) {
			var collection = getCollection(coll);

			doc._id = uuid.v4();
			collection[doc._id] = doc;
			return done(null, _.clone(doc));
		},

		findOne: function (coll, cond, done) {
			var collection = getCollection(coll);

			for (var i in collection){
				var found = true
				for (var j in cond) {
					if (cond[j] !== collection[i][j]) {
						found = false
						break
					}
					if (found) {
						return done(null, _.clone(collection[i]));
					}
				}
			}
			return done()
		},

		findByIdAndDelete: function (coll, cond, done) {
			internals.findOne(cond, function (err, doc) {
				if (err) {
					return done(err);
				}

				if (!doc) {
					return done();
				}

				delete getCollection(coll)[doc._id];
				return done(err, doc);
			});
		},

		update: function (coll, cond, setValues, done) {
			internals.findOne(cond, function (err, doc) {
				if (err) {
					return done(err);
				}

				if (!doc) {
					return done();
				}

				getCollection(coll)[doc._id] = doc;
				return done(err, _.clone(doc));
			});
		}
	};

	server.expose('instance', internals);

	next();
};

exports.register.attributes = {
	name: 'db'
};
