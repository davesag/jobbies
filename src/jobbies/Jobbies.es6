"use strict";

import config    from './configuration.es6';
import Commander from './commander/Commander.es6';
import Botkit    from 'Botkit';

const redis  =  require('Botkit/lib/storage/redis_storage');

const Jobbies = Botkit.slackbot({
  debug: false,
  storage: redis({
    namespace: 'jobbies'
  })
});

let commander = null;

const startupCallback = (err, bot, payload) => {
  if (err) {
    console.error("startup callback", err);
    throw new Error("Could not connect to Slack!");
  }

  commander = new Commander(Jobbies, payload);
  
  console.info(`Started ${bot.identity.name} for domain https://${bot.team_info.domain}.slack.com`);
};

Jobbies.spawn({
  token: config.slackbot_api_key
}).startRTM(startupCallback);

export { Jobbies as default };
