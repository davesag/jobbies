/*
  Option - A "sub command" for a command.
*/

class Option {

  constructor(
    command,
    option,
    regex,
    parameters = null,
    onCallback = null,
    helpText = null
  ) {
    this.command = command;
    this.option = [].concat(option);
    this.regex = [].concat(regex);
    this.parameters = !!parameters ? [] : [].concat(parameters);
    this.onCallback = onCallback || null;
    this.helpText = helpText || "No help available.";

    // sanity checks
    if (this.option.length != this.regex.length) {
      let msg = `Error in command option ${this.command}:
      options and regular expressions for the listening parameter need to be the same in number.`;
      throw Error(msg);
    }

    if (typeof this.onCallback != "function") {
      let msg = `Error in command option ${this.command} ${this.option}:
      no callback function defined. Please do so.`;
      throw Error(msg);
    }
  }

  getOptionsAndRegexes() {
    let [ options, regexes ] = [ this.option, this.regex ];
    let [ ol, rel ] = [ options.length, regexes.length ];

    if (ol != rel) throw Error(`Command Option ${command}: RegEx pattern and options numbers do not match.`);
    return [options, regexes];
  }

  getListenToPatterns() {
    let command = this.command;
    let commands = [];

    let [ options, regexes ] = this.getOptionsAndRegexes();

    for (let i = 0, l = regexes.length; i < l; i++) {
      let [ option, regex ] = [ options[i], regexes[i] ];
      let cmd = option.length === 0 ? `^${command}${regex}` : `^${command} ${regex}`;
      commands.push(cmd);
    }

    return commands;
  }

  getReadableCommands() {
    let command = this.command;
    let commands = [];

    let [ options, _ ] = this.getOptionsAndRegexes();

    for (let i = 0; i < options.length; i++) {
      let option = options[i];
      let cmd = `${command} ${option}`;
      commands.push(cmd);
    }

    return commands;
  }

  helpText() {
    let params = this.parameters.length > 0 ? " " + this.parameters.join(" ") : "";
    let options = this.option.join("|");
    let help = `${this.command} ${options}${params}\n\t${this.helpText}`;
    return help;
  }
}

export { Option as default };
