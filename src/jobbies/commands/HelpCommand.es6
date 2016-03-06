//
// HelpCommand
//

import Command              from '../commander/Command.es6';
import Option               from '../commander/Option.es6';

import { Promise }          from 'bluebird';

const COMMAND     = "help";
const DESCRIPTION = `displays available commands or help for a specific command`;

class HelpCommand extends Command {

    constructor(commander, listenToTypes) {
        console.info("Initialising HelpCommand");

        super(COMMAND, DESCRIPTION, commander, listenToTypes);

        this.onHelp = this.onHelp.bind(this);

        const options = [
            new Option(this.name, ["", "info", "?"], ["", "info$", "\\?"], "", this.onHelp, DESCRIPTION)
        ];

        this.setupOptions(options);
    }

    helpText() {
        return this.helpDescription();
    }

    onHelp(bot, message) {
        let commands = this.commander.commands || [];
        let helpForCommand = this.getCommandArguments(message, this.onHelp);
        let reply = [];

        let fnFormatCommandHelp = (cmd, useFullDescription=false, alt="") => {
            if (!cmd) return alt;
            let msg = "";
            try {
                msg = useFullDescription ? cmd.helpText() : cmd.helpDescription();
            } catch(err) {
                console.error(`${cmd.name} error: ${err.message}`);
                msg = `Command '${cmd.name}' has no help available. :-(`;
            }
            return msg;
        };

        if (helpForCommand !== null && helpForCommand.length > 0) {
            helpForCommand = helpForCommand.toLowerCase();
            
            let cmd = commands.find(c => c.name === helpForCommand);
            let msg = fnFormatCommandHelp(cmd, true, `There is no command *${helpForCommand}* available for this bot.`);
            
            reply.push(msg);

        } else {
            reply.push("Available commands are:\n");

            for (let cmd of commands) {
                let msg = fnFormatCommandHelp(cmd);
                reply.push(msg);
            }
        }

        bot.reply(message, reply.join("\n\n"));
    }

}

export { HelpCommand as default };
