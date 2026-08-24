const { google } = require('googleapis');

let driveClient = null;

/**
 * Initializes and returns a Google Drive API client using Service Account credentials.
 */
const getGoogleDriveClient = () => {
  if (driveClient) return driveClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    console.warn('[Google Drive] Service Account credentials not provided in .env. Running in public/mock Drive mode.');
    return null;
  }

  // Handle escaped newline strings in env vars
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    const auth = new google.auth.JWT(
      email,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file']
    );

    driveClient = google.drive({ version: 'v3', auth });
    console.log('[Google Drive] Authenticated successfully with Service Account.');
    return driveClient;
  } catch (error) {
    console.error('[Google Drive Auth Error]', error.message);
    return null;
  }
};

module.exports = { getGoogleDriveClient };
