class SlackApi {

  constructor(slackInfo) {
    this.slackInfo = slackInfo;
  }

  users() {
    let info = this.slackInfo || null;
    if (info === null || !Array.isArray(info.users)) {
      console.warn("Not connected to Slack.");
      return [];
    }
    return info.users;
  }
}

export { SlackApi as default };
