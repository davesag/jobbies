//
// This file must be in ES5 and is the start up file for our bot.
//
// http://stackoverflow.com/a/33644849/193165
//

"use strict";

require('dotenv').config();

if (!process.env.SLACKBOT_API_KEY) {
  console.error("Error: You must supply your Slack API key via the environment variable 'SLACKBOT_API_KEY'.");
  console.info("See https://my.slack.com/services/new/bot for more details.");
  process.exit(1);
}

console.log("pre-compiling ES6 code…");

require("babel-polyfill");
require("babel-core/register"); // will translate all other includes via babel so we can use es6 syntax

// Now spawn the process that handles the bot/slack communication, ie your Bot.
require("./src/jobbies/Jobbies.es6"); 

console.log("Done - Your bot is running now. Press CTRL-C to stop it.");
