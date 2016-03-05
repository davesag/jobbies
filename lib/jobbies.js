'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var Jobbies = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'jobbies';
  this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'norris_jokes.db');

  this.user = null;
  this.db = null;
};
Jobbies.prototype.run = function () {
  Jobbies.super_.call(this, this.settings);
  console.log('DEBUGGING: run', this)

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
};
Jobbies.prototype._onStart = function () {
  this._loadBotUser();
  this._connectDb();
  this._firstRunCheck();
  console.log('started server', this.name, 'for', this.user.name, 'channel', this.channels[0].name);
};
Jobbies.prototype._loadBotUser = function () {
  var self = this;
  this.user = this.users.filter(function (user) {
    return user.name === self.name;
  })[0];
};
Jobbies.prototype._connectDb = function () {
  if (!fs.existsSync(this.dbPath)) {
    console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
    process.exit(1);
  }

  this.db = new SQLite.Database(this.dbPath);
  console.log('db loaded', this.db.filename);
};
Jobbies.prototype._firstRunCheck = function () {
  var self = this;
  self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function (err, record) {
    if (err) {
      return console.error('DATABASE ERROR:', err);
    }

    var currentTime = (new Date()).toJSON();

    // this is a first run
    if (!record) {
      self._welcomeMessage();
      return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
    }

    // updates with new last running time
    self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
  });
};
Jobbies.prototype._welcomeMessage = function () {
  this.postMessageToChannel(
    this.channels[0].name,
    'Just say `' + this.name + '` to invoke me!',
    {as_user: true}
  );
};
Jobbies.prototype._onMessage = function (message) {
  if (this._isChatMessage(message) &&
    this._isChannelConversation(message) &&
    !this._isFromJobbies(message) &&
    this._isMentioningJobbies(message)
  ) {
    this._replyWithHelloWorld(message);
  }
};
Jobbies.prototype._isChatMessage = function (message) {
  return message.type === 'message' && Boolean(message.text);
};
Jobbies.prototype._isChannelConversation = function (message) {
  return typeof message.channel === 'string' &&
  message.channel[0] === 'C';
};
Jobbies.prototype._isFromJobbies = function (message) {
  return message.user === this.user.id;
};
Jobbies.prototype._isMentioningJobbies = function (message) {
  return message.text.toLowerCase().indexOf('jobbies') > -1 ||
         message.text.toLowerCase().indexOf(this.name) > -1;
};
Jobbies.prototype._getChannelById = function (channelId) {
  return this.channels.filter(function (item) {
    return item.id === channelId;
  })[0];
};
Jobbies.prototype._replyWithHelloWorld = function (originalMessage) {
  console.log('hello world', originalMessage)
  var self = this;
  self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1',
    function (err, record) {
      if (err) {
        return console.error('DATABASE ERROR:', err);
      }

      var channel = self._getChannelById(originalMessage.channel);
      self.postMessageToChannel(channel.name, record.joke, {as_user: true});
      self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
    }
  );
};
// inherits methods and properties from the Bot constructor
util.inherits(Jobbies, Bot);

module.exports = Jobbies;
