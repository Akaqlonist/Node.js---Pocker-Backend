/**
 * Created by admin on 3/11/17.
 */

var Immutable = require('immutable');
var bcrypt = require('bcrypt');
var db = require('./db.js');
var async = require('async');

const User = Immutable.Record({
    email: null,
    salt: null,
    passwordHash: null
});

User.login = function (body, cb) {
    async.waterfall([
        function (done) {
            User.get(body.email.toLowerCase(), done);
        },
        function (result, done) {
            if (result.rows.length !== 0) {
                bcrypt.compare(body.password, result.rows[0].passwordHash, function (err, isValid) {
                    cb(err, result, isValid);
                });
            } else {
                cb('Email does not exist');
            }
        }
    ], function (err) {
        cb(err);
    });
}

User.updateName = function (body, id, done) {
    db.query('UPDATE public.users SET name=$1, "photoNum"=$2 WHERE "id" = $3',
        [body.name, body.photoNum, id], function (err, ignored) {
        done(err, ignored)
    });
}

User.updateChips =  function (id, chips) {
    db.query('UPDATE public.users SET "fakeMoney"=$1 WHERE "id" = $2',
        [chips, id], function (err, ignored) {
            return;
        });
}

User.signup = function (body, cb) {
    const email = body.email.toLowerCase();
    async.waterfall([
        function(done) {
            User.get(email, done);
        },
        function (result, done) {
            if (result.rows.length == 0) {
                bcrypt.genSalt(10, done);
            } else {
                done('Email already exists');
            }
        },
        function (salt, done) {
            bcrypt.hash(body.password, salt, function (err, hash) {
                done(err, salt, hash)
            });
        },
        function (salt, hash, done) {
            User.create(email, salt, hash, body, done);
        },
        function (user, done) {
            cb(null, user);
        }
    ],  function (err) {
            cb(err);
        }
    );
};

User.get = function (email, done) {
    db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()], done);
}

User.getById = function (id, done) {
    db.query('SELECT * FROM users WHERE id = $1', [id], done);
}

User.create = function (email, salt, hash, body, done) {
    db.query('INSERT INTO public.users(email, salt, "passwordHash", "photoNum", name, "fakeMoney", "realMoney")  VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING email, "photoNum", name, "fakeMoney", "realMoney";',
        [email, salt, hash, 0, "Player", 100000, 0],
        function (err, result) {
            console.log(err);
            if (err) {
                done(err, null);
                return;
            }
            done(err, result.rows[0])
        });
    }

module.exports = User;