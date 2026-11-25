// Extends app.json. Android push notifications need Firebase's google-services.json: it is added to the app only when
// the file is present, so builds keep working before Firebase is set up. See docs/PUSH_ANDROID.md.
const fs = require('fs');
const path = require('path');

module.exports = ({ config }) => {
  const local = './google-services.json';
  // An EAS "file" environment variable wins over a file in the folder.
  const file = process.env.GOOGLE_SERVICES_JSON || (fs.existsSync(path.join(__dirname, local)) ? local : null);
  if (!file) return config;
  return { ...config, android: { ...config.android, googleServicesFile: file } };
};
