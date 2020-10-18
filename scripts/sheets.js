/* eslint-disable camelcase */
const fs = require('fs')
const R = require('ramda')
const readline = require('readline')
const { google } = require('googleapis')
const { isNumeric, fromNaturalLanguage, toSnakeCase } = require('./helpers')

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const SPREADSHEET_ID = '1NXh0Rng0sDL8RMd60TUUZC-5uD65O8expf-r3tlbXFs'

function sheetsSpreadsheetsValuesGetPromise(options, auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(options, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res)
    });
  })
}
const removeEmptyValuePairs = R.map(R.pipe(
  R.toPairs,
  // eslint-disable-next-line no-unused-vars
  R.reject(([_, value]) => value === '' || value === '0'),
  R.fromPairs,
))
const parseNumberValues = R.map(R.pipe(
  R.toPairs,
  R.map(([_, value]) => {
    if (isNumeric(value)) {
      return [_, parseInt(value, 10)]
    }
    return [_, value]
  }),
  R.fromPairs,
))
const keysToSnakeCase = ['id', 'quest name', 'location', 'difficulty', 'waves']
const snakeCaseSomeKeys = R.map(R.pipe(
  R.toPairs,
  R.map(([key, _]) => {
    const formatToSnakeCase = R.pipe(
      fromNaturalLanguage,
      toSnakeCase,
    )
    if (keysToSnakeCase.includes(key.toLowerCase())) {
      return [formatToSnakeCase(key), _]
    }
    return [key, _]
  }),
  R.fromPairs,
))

module.exports = () =>
  new Promise((resolve, reject) => {
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    function getNewToken(oAuth2Client, callback) {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });
      console.log('Authorize this app by visiting this url:', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error while trying to retrieve access token', err);
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err2) => {
            if (err2) return console.error(err);
            return console.log('Token stored to', TOKEN_PATH);
          });
          return callback(oAuth2Client);
        });
      });
    }

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
      const { client_secret, client_id, redirect_uris } = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        return callback(oAuth2Client);
      });
    }

    /**
     * Prints the names and majors of students in a sample spreadsheet:
     * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
     * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
     */
    async function listMajors(auth) {
      try {
        const res = await sheetsSpreadsheetsValuesGetPromise({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Data!A:ZZZ',
          majorDimension: 'ROWS',
        }, auth)
        const rows = res.data.values;
        if (rows.length) {
          const [keys, ...actualDataRows] = rows
          const jsonObject = actualDataRows.map(R.zipObj(keys))
          resolve(R.pipe(
            removeEmptyValuePairs,
            parseNumberValues,
            snakeCaseSomeKeys,
          )(jsonObject))
        } else {
          console.log('No data found.');
          reject()
        }
      } catch (err) {
        console.log(`The API returned an error: ${err}`)
        reject()
      }
    }

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      return authorize(JSON.parse(content), listMajors);
    });
  })
