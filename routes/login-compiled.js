"use strict";

var express = require("express");
var router = express.Router();
var pg = require("pg");
var knex = require("../db/knex");
var bcrypt = require("bcrypt");

router.get('/', function (req, res) {
  if (req.session.id) {
    res.redirect(`/user/${ req.session.id }`);
  } else {
    res.render('login');
  }
});

router.post('/', function (req, res) {
  knex('users').where('email', req.body.email).then(function (user) {
    if (user) {
      if (bcrypt.compareSync(req.body.password, user[0].password)) {
        req.session.id = user[0].id;
        res.redirect(`/user/${ user[0].id }`);
      } else {
        res.render('login', { error: 'Email / Password do not match' });
      }
    } else {
      res.render('login', { error: 'Email / Password do not match' });
    }
    res.redirect(`/user/${ user[0].id }`);
  });
});

module.exports = router;

//# sourceMappingURL=login-compiled.js.map