/**
 This is the root Command from which all other Commands derive.
*/

import { removeCommandFromMessage } from '../utils.es6';

class Command {

  constructor(name, description, commander, listenToTypes) {
    this.name = name;
    this.description = description || "Missing command description";
    this.commander     = commander;
    this.listenToTypes = listenToTypes || null;
    this.controller    = commander.controller;
    this.slackInfo     = commander.slackInfo;
  }

  listenTo(messages, whatToListenTo, callback) {
    console.info(`listenTo(${messages}, ${whatToListenTo}, cb)`);
    let ms = Array.isArray(messages) ? messages : [messages];
    this.controller.hears(ms, whatToListenTo, callback);
  }

  setupOptions(options = []) {
    for (let option of options) {
      let listenPatterns = option.getListenToPatterns();
      this.listenTo(listenPatterns, this.listenToTypes, option.onCallback);
    }
    this.options = options;
  }

  getCommandArguments(message, fn) {
    let option = this.options.find(opt => opt.onCallback === fn)
    if (option) {
      let cmd = option.getReadableCommands();
      let args = removeCommandFromMessage(message, cmd);
      if (args) {
        return args;
      }
    }
    return null;
  }

  helpText() {
    let msg = [
      this.helpDescription(),
      "```"
    ];
    this.options.forEach(opt => msg.push(opt.helpText()));

    msg.push("```");
    
    return msg.join("\n");
  }

  helpDescription() {
    return `*${this.name}* ${this.description}.`;
  }
}

export { Command as default };
