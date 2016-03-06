/*
  globally available configuration parameters
*/

// read environment parameters
if (!process.env.ADMIN_PASS) {
  console.warn("Warning: 'ADMIN_PASS' environment variable not defined.");
}

const config = {
  slackbot_api_key: process.env.SLACKBOT_API_KEY || null,
  admin_pass: process.env.ADMIN_PASS || "Password1"
};

export { config as default };
