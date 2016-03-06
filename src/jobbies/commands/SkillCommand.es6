/*
  SkillCommand
  * skill add skill_name
  * skill remove skill_name
  * skill list
  * skill all
*/

import Command     from '../commander/Command.es6';
import Option      from '../commander/Option.es6';

import { Promise } from 'bluebird';

const COMMAND     = "skill";
const DESCRIPTION = "Add and remove skills from your skill list, list your, or your team's skills, and find users with a skill.";

const ERRORS = {
  no_skills:         "You have not told me about your skills",
  no_team_skills:    "No-one in your team has told me about their skills",
  skill_not_in_team: "No-one in your team has that skill",
  user_read:         "There was an error retreiving the user",
  user_write:        "There was an error saving your skills",
  team_read:         "There was an error retreiving the team data",
  team_write:        "There was an error saving your skills to the team-wide index",
  remove_skill:      "Unable to remove skill",
  have_skill:        "You already have skill",
  skills_write:      "There was an error saving your skills"
};

class SkillCommand extends Command {

  constructor(commander, listenToTypes) {
    console.info("Initialising SkillCommand");
    super(COMMAND, DESCRIPTION, commander, listenToTypes);

    this.onGetSkills    = this.onGetSkills.bind(this);
    this.onGetAllSkills = this.onGetAllSkills.bind(this);
    this.onAddSkill     = this.onAddSkill.bind(this);
    this.onRemoveSkill  = this.onRemoveSkill.bind(this);
    this.onFindUsersWithSkill  = this.onFindUsersWithSkill.bind(this);

    // command, option, regex, parameters=null, onCallback=null, helpText=null
    const options = [
      new Option(COMMAND, "add",    "add",    "<skill>", this.onAddSkill,     "Add a skill to your list."),
      new Option(COMMAND, "remove", "remove", "<skill>", this.onRemoveSkill,  "Remove a skill from your list."),
      new Option(COMMAND, "find",   "find",   "<skill>", this.onFindUsersWithSkill, "Find all users with the given skill."),
      new Option(COMMAND, "list",   "list$",  "",             this.onGetSkills,    "List all of your skills."),
      new Option(COMMAND, "all",    "all$",   "",             this.onGetAllSkills, "List all of the skills in the team."),
    ];

    this.setupOptions(options);
  }

  getSkillFromCommand(message, for_function) {
    return this.getCommandArguments(message, for_function).toLowerCase()
  }

  decorateSkill(skill) {
    return '`' + skill + '`'
  }

  async onFindUsersWithSkill(bot, message) {
    this.controller.storage.teams.get(message.team, (err, team) => {
      if (err)   return bot.reply(message, `${ERRORS.team_read}: ${err}`);
      if (!team) return bot.reply(message, ERRORS.no_team_skills);

      let skill = this.getSkillFromCommand(message, this.onFindUsersWithSkill);
      let skillsMap = team.skills || {};
      let skills = Object.keys(skillsMap);
      if (skills.length === 0) return bot.reply(message, ERRORS.no_team_skills);
      let userIds = skillsMap[skill] || [];
      if (userIds.length === 0) return bot.reply(message, `${ERRORS.skill_not_in_team}: ${this.decorateSkill(skill)}`);
      let msg = userIds.reduce((result, userId) => {
        let user = this.commander.slackApi.users().find(usr => usr.id == userId);
        return `${result.length == 0 ? '' : result + ', '}<@${userId}|${user.name}>`;
      }, "");
      bot.reply(message, `Users with skill ${this.decorateSkill(skill)}: ${msg}.`);
    });
  }

  async onGetAllSkills(bot, message) {
    this.controller.storage.teams.get(message.team, (err, team) => {
      if (err)   return bot.reply(message, `${ERRORS.team_read}: ${err}`);
      if (!team) return bot.reply(message, ERRORS.no_team_skills);

      let skillsMap = team.skills || {};
      let skills = Object.keys(skillsMap);
      if (skills.length === 0) return bot.reply(message, ERRORS.no_team_skills);

      let msg = skills.reduce((result, skill) => {
        return `${result.length == 0 ? '' : result + ', '}${this.decorateSkill(skill)}`;
      }, "");
      bot.reply(message, `Your team's skills: ${msg}.`);
    });
  }

  async onGetSkills(bot, message) {
    this.controller.storage.users.get(message.user, (err, user) => {
      if (err)   return bot.reply(message, `${ERRORS.user_read}: ${err}`);
      if (!user) return bot.reply(message, ERRORS.no_skills);

      let skills = user.skills || [];
      if (skills.length === 0) return bot.reply(message, ERRORS.no_skills);

      let msg = skills.reduce((result, skill) => {
        return `${result.length == 0 ? '' : result + ', '}${this.decorateSkill(skill)}`;
      }, "");
      bot.reply(message, `Your skills: ${msg}.`);
    });
  }

  async onAddSkill(bot, message) {
    this.controller.storage.users.get(message.user, (err, user) => {
      if (err) return bot.reply(message, `${ERRORS.user_read}: ${err}`);

      let skill = this.getSkillFromCommand(message, this.onAddSkill);
      if (!user) {
        bot.reply(message, 'Adding your first skill!');
        user = {
          id: message.user,
          skills: [skill]
        }
      } else {
        if (user.skills.indexOf(skill) !== -1)
          return bot.reply(message, `${ERRORS.have_skill} ${this.decorateSkill(skill)}`);

        user.skills.push(skill);
      }
      this.controller.storage.users.save(user, (err) => {
        if (err) return bot.reply(message, `${ERRORS.user_write}: ${err}`);

        this.controller.storage.teams.get(message.team, (err, team) => {
          if (err) return bot.reply(message, `${ERRORS.team_read}: ${err}`);

          if (!team) {
            bot.reply(message, 'Adding the first skill for your team!');
            let skills = {};
            skills[skill] = [user.id]
            team = {
              id: message.team,
              skills: skills
            }
          } else {
            let skill_index = team.skills[skill] || [];
            if (skill_index.indexOf(user.id) === -1) {
              skill_index.push(user.id);
              team.skills[skill] = skill_index;
            }
          }
          this.controller.storage.teams.save(team, (err) => {
            if (err) return bot.reply(message, `${ERRORS.team_write}`);

            bot.reply(message, `Added skill ${this.decorateSkill(skill)} to your list.`);
          });
        });
      });
    });
  }

  async onRemoveSkill(bot, message) {
    this.controller.storage.users.get(message.user, (err, user) => {
      if (err)   return bot.reply(message, `${ERRORS.user_read}: ${err}`);
      if (!user) return bot.reply(message, `${ERRORS.remove_skill} '${skill}'`);

      let skill = this.getSkillFromCommand(message, this.onRemoveSkill);
      let skills = user.skills;
      if (!skills || skills.length === 0 || skills.indexOf(skill) === -1)
        return bot.reply(message, `${ERRORS.remove_skill}: You don't have skill ${this.decorateSkill(skill)}`);

      skills.splice(skills.indexOf(skill), 1);
      this.controller.storage.users.save({id: message.user, skills: skills}, (err) => {
        if (err) return bot.reply(message, `${ERRORS.skills_write}: ${err}`);

        this.controller.storage.teams.get(message.team, (err, team) => {
          if (err || !team) return bot.reply(message, `${ERRORS.team_read}: ${err}`);

          let skill_users = team.skills[skill] || [];
          skill_users.splice(skill_users.indexOf(user.id), 1);
          if (skill_users.length === 0) {
            delete team.skills[skill]
          } else {
            team.skills[skill] = skill_users;
          }
          this.controller.storage.teams.save(team, (err) => {
            if (err) return bot.reply(`${ERRORS.team_write} : ${err}`);

            bot.reply(message, `Removed skill ${this.decorateSkill(skill)} from your list.`)
          });
        })
      });
    });
  }
 }

export { SkillCommand as default };
