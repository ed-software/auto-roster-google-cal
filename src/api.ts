import * as fs from 'fs';
var readline = require('readline');
import { google } from 'googleapis';
import { Compute, JWT, OAuth2Client, UserRefreshClient } from 'google-auth-library';

type AuthType = string | OAuth2Client | JWT | Compute | UserRefreshClient;

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

interface ICredentials {
  installed: {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: string[];
  }
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials: ICredentials, callback: (auth: AuthType) => void) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err: NodeJS.ErrnoException | null, token: any) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client: any, callback: any) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code: any) => {
    rl.close();
    oAuth2Client.getToken(code, (err: any, token: any) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err: any) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

export function createEventsFromDays(days: any) {
  // Load client secrets from a local file.
  fs.readFile("credentials.json", (err: NodeJS.ErrnoException | null, content: any) => {
    if (err) return console.log("Error loading client secret file:", err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), (auth) => {
      days.forEach((day: any) => {
        day.shifts.forEach((shift: any) => {
          createEvent(auth, shift.summary, shift.start, shift.end)
        });
      });
    });
  });
}

function createEvent(auth: AuthType, summary: string, startTime: Date, endTime: Date) {
  const event = {
    summary,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: "Australia/Sydney",
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "Australia/Sydney",
    },
  };

  const calendar = google.calendar({ version: "v3", auth });
  calendar.events.insert(
    {
      auth,
      calendarId: "primary",
      requestBody: event,
    },
    function (err: any, event: any) {
      if (err) {
        console.log(
          "There was an error contacting the Calendar service: " + err
        );
        return;
      }
      console.log("Event created: %s", startTime.toString());
    }
  );
}
