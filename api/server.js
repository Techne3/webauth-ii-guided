const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session') // npm i express-session
const KnexSessionsStorage = require("connect-session-knex")(session) // has to be below session ***  for storing sessions in DB

const authRouter = require('../auth/auth-router.js');
const usersRouter = require('../users/users-router.js');
const KnexConnection = require('../database/dbConfig');

const server = express();

// 2 configure the sessions and cookies
const sessionConfiguration = {
  name: 'booger',  // default name is sid
  secret: process.env.COOKIE_SECRET || 'is it secret? is it safe?',
  cookie: {
    maxAge: 1000 * 60 * 60, // valid for 1 hour (in milliseconds)
    secure: process.env.NODE_ENV === 'development' ? false : true ,  // do we send cookie over http only ?
    httpOnly: true, // prevent client javascript code from accessing the cookie
  
  },
  resave: false, // save sessios even when they have not changed
  saveUninitialized: true,  // read about it on the docs to respect GDPR
  store: new KnexSessionsStorage ({
    knex: KnexConnection,
    clearInterval: 1000 * 60 * 10, //delete expired sessions every 10 minutes 
    tablename: 'user_sessions',
    sidfieldname: 'id',
    createTable: true,
  })
}

server.use(helmet());
server.use(express.json());
server.use(cors()); // research credentials: "true" and "withCredentials" when connecting from your React app.
server.use(session(sessionConfiguration))// 3 use the sessions middleare globally 

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

server.get('/', (req, res) => {
  res.json({ api: 'up', session: req.session});
});

module.exports = server;
