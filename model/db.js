var pg = require('pg');

var DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:a@localhost:5432/poker';
//var DATABASE_URL = process.env.DATABASE_URL;

var exports = module.exports = {};

exports.query = function(text, values, cb) {
    pg.connect(DATABASE_URL, function (err, client, done) {
        client.query(text, values, function (err, result) {
            done();
            cb(err, result);
        });
    });
};