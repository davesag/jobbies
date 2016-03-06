"use strict";

let removeCommandFromMessage = (msg, commands) => {
  let text = (msg.text || "").trim();
  commands = [].concat(commands);

  for (let cmd of commands) {
    if (cmd.substr(-1) === "$") {
      cmd = cmd.substr(0, cmd.length - 1);
    }

    let matches = text.match(cmd);
    if (matches) {
      for (let m of matches) {
        let idx = text.indexOf(m);
        text = text.substr(idx + m.length).trim();
      }
      continue;
    }

    let pos = text.toLowerCase().indexOf(cmd.toLowerCase());
    if (pos > -1 && pos < 3) {
      text = text.substr(pos + cmd.length).trim();
    }
  }

  if (text[0] == '"') {
    text = text.substr(1).trim();
  }
  if (text.substr(-1) == '"') {
    text = text.substr(0, text.length - 1).trim();
  }

  return text.trim();
};

export { 
  removeCommandFromMessage
};
