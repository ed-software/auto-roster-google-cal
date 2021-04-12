# Auto Roster

I built this to save myself from tediously copying my emailed work roster into Google Calendar. 

## How to Use

1. Clone this repository
2. Run `yarn install`
3. Create a Google Cloud Platform app with access to the Gmail API and download your credentials.json to the root directory [like this](https://developers.google.com/workspace/guides/create-credentials#desktop).
4. Copy your week's roster into a file called `roster.txt` in the root directory
5. Run `yarn start`
6. Authenticate the app using the link found in the console
7. Voilà
