#! bin/bot.js

'use strict';

var Jobbies = require('../lib/jobbies');
var token = process.env.BOT_API_KEY;
var dbPath = process.env.BOT_DB_PATH;
var name = process.env.BOT_NAME;

var jobbies = new Jobbies({
  token: token,
  dbPath: dbPath,
  name: name
});

jobbies.run();
