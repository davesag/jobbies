# jobbies

A job bot for Slack (yes okay I'm just experimenting here but this might turn into something)

## Install

`git clone` this, run `npm install` then `npm start` or `node server`

Set up a Bot in your Slack integrations (use https://my.slack.com/services/new/bot).

You will need to supply your API key in `SLACKBOT_API_KEY`. You can put environment variables in a local `.env` file and they will be loaded via [dotenv](https://www.npmjs.com/package/dotenv). Simply `cp env_example .env` and fill in the details.

It uses the `SLACKBOT_API_KEY` to attach itself to your Slack team, [as per the configuration](https://my.slack.com/services/new/bot). system.

It will spit out a bunch of stuff into the console and then say `Started jobbies for domain https://YOUR_SLACK_DOMAIN.slack.com`.

You'll see a `• Jobbies` user appear in your Slack window with a green light.

You can either chat with the Jobbies user directly, or use the following commands in any channel Jobbies has been invited to.

### Add and remove skills

* `skill add Node` - adds `node` to your list of skills.
* `skill remove Node` - removes `node` from your list of skills.

### List skills

* `skill list` - lists all your skills.
* `skill all` - lists all the skills your team has.

### Find users

* `skill find node` - lists all the users with skill `node`.

### Show help

* `help`

## Tests

```sh
npm test
```

## Contributing

This is basically a sandpit for my playing with Slackbots, but it's consolidating into something, I'm just not sure what.

If you really have some burning thing to add to the code base

1. Raise an issue describing the problem
2. Fork [the upstream repo](https://github.com/davesag/jobbies), create your own feature branch and let [Dave Sag](https://github.com/davesag) know via a Pull Request.

## Thanks

This all started as a self-learning project one unseasonably hot weekend here in Canberra.

I've unashamedly pillaged ideas and code from the following articles and code bases

* [Building a Slack Bot with Node.js and Chuck Norris Super Powers](https://scotch.io/tutorials/building-a-slack-bot-with-node-js-and-chuck-norris-super-powers)
* [Botkit](https://github.com/howdyai/botkit) and BitKit's [demo_bot](https://github.com/howdyai/botkit/blob/master/examples/demo_bot.js)
* [slackbot-botkit-es6-example](https://github.com/dgollub/slackbot-botkit-es6-example)
* and more to come I assure you…
