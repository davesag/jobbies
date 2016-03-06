/*
  The Commander inpreprets all incoming commands and delegates them to Commands as approproate.
*/ 

import SlackApi            from '../../slack/SlackApi.es6'
import SkillCommand        from '../commands/SkillCommand.es6';
import HelpCommand         from '../commands/HelpCommand.es6';

import {
  LISTEN_TO_OTHERS,
  LISTEN_TO_ALL_BUT_AMBIENT,
  LISTEN_TO_BOTNAME,
  LISTEN_TO_ALL
} from '../constants.es6';

// TODO: return help command by default.
class Commander {

  constructor(controller, slackInfo) {
    this.controller = controller;
    this.slackInfo  = slackInfo;
    this.slackApi   = new SlackApi(slackInfo);

    // this is annoying boilerplate
    this.onUserChange        = this.onUserChange.bind(this);
    this.onTeamJoin          = this.onTeamJoin.bind(this);
    this.updateCacheUserInfo = this.updateCacheUserInfo.bind(this);

    // listen to team_join and user_change events to make sure you update your cached user list
    this.controller.on('team_join', this.onTeamJoin);
    this.controller.on('user_change', this.onUserChange);

    this.commands = [];
    this.commands.push(new HelpCommand(this, LISTEN_TO_BOTNAME));
    this.commands.push(new SkillCommand(this, LISTEN_TO_ALL_BUT_AMBIENT));
  }

  onTeamJoin(bot, message) {
    this.updateCacheUserInfo(message.user);
  }

  onUserChange(bot, message) {
    this.updateCacheUserInfo(message.user);
  }

  updateCacheUserInfo(user) {
    console.info("Need to add or update cached info for user ", user.id);

    let users = this.slackApi.users();
    let idx = users.findIndex((u) => u.id === user.id);

    if (idx !== -1) {
      this.slackInfo.users[idx] = user;
    } else {

      if (users.length === 0) {
        this.slackInfo.users = [];
      }
      this.slackInfo.users.push(user);

      controller.storage.users.save(user, (err, id) => {
        if (err) {
          console.error("Could not add user to internal cache.", err, user);
        }
      });
    }
  }

  loadUserFromMessage(message, next) {

    let [ controller, info ] = [ this.controller, this.slackInfo ];

    controller.storage.users.get(message.user, (err, user) => {
      if (!user) {
        let uid = message.user || "-1doesnotexists";
        let users = this.slackApi.users();
        let foundUser = users.find((u) => u.id === uid);
        if (foundUser) user = foundUser;
      }

      if (user) {
        controller.storage.users.save(user, (err) => {
          if (err) {
            console.warn("Could not save user", err);
            if (next) return next();
          };
          if (next) return next(user);
        });
      } else {
        console.warn("Could not find user in message.");
      }
    });
  }
}

export { Commander as default };
