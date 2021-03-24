"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventsFromDays = void 0;
var fs = __importStar(require("fs"));
var readline = require('readline');
var googleapis_1 = require("googleapis");
// If modifying these scopes, delete token.json.
var SCOPES = ["https://www.googleapis.com/auth/calendar.events"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
var TOKEN_PATH = "token.json";
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var _a = credentials.installed, client_secret = _a.client_secret, client_id = _a.client_id, redirect_uris = _a.redirect_uris;
    var oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err)
            return getAccessToken(oAuth2Client, callback);
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
function getAccessToken(oAuth2Client, callback) {
    var authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", function (code) {
        rl.close();
        oAuth2Client.getToken(code, function (err, token) {
            if (err)
                return console.error("Error retrieving access token", err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), function (err) {
                if (err)
                    return console.error(err);
                console.log("Token stored to", TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}
function createEventsFromDays(days) {
    // Load client secrets from a local file.
    fs.readFile("credentials.json", function (err, content) {
        if (err)
            return console.log("Error loading client secret file:", err);
        // Authorize a client with credentials, then call the Google Calendar API.
        days.forEach(function (day) {
            return day.shifts.forEach(function (shift) {
                authorize(JSON.parse(content), function (auth) {
                    return createEvent(auth, shift.summary, shift.start, shift.end);
                });
            });
        });
    });
}
exports.createEventsFromDays = createEventsFromDays;
function createEvent(auth, summary, startTime, endTime) {
    console.log(startTime.toString());
    var event = {
        summary: summary,
        start: {
            dateTime: startTime.toISOString(),
            timeZone: "Australia/Sydney",
        },
        end: {
            dateTime: endTime.toISOString(),
            timeZone: "Australia/Sydney",
        },
    };
    var calendar = googleapis_1.google.calendar({ version: "v3", auth: auth });
    calendar.events.insert({
        auth: auth,
        calendarId: "primary",
        requestBody: event,
    }, function (err, event) {
        if (err) {
            console.log("There was an error contacting the Calendar service: " + err);
            return;
        }
        console.log("Event created: %s", event.htmlLink);
    });
}
