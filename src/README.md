# User Analytics Developer guide

## How to obtain the source code:
Clone this repository to your local machine to access the source code. You may also fork this repository for your own copy.

## Repository Layout
### src
This folder contains the main Chrome extension and developer documentation. Any functioal changes should be here. Upload this folder to Google Chrome to install UserAnalytics.

### test
This folder cotains all the unit tests for both frontend and backend featurese of UserAnalytics.

### Reports
This folder is for weekly CSE 403 status reports. It contains a markdown template file for future status reports.

## Build & Test System
- The system will be automatically built when Chrome loads the folder. 
- Note that 'manifest.json' contains the set-up information for chrome extensions.
- Pushing code to the ‘main’ branch of our GitHub repository or opening a pull request to the ‘main’ branch will trigger a CI build. CI testing can also be manually triggered from GitHub’s actions tab.

## How to add new tests

## How to build a release of the software.
Again the system automatically builds when Chrome loads the extension. In the future the may be releases on the Chrome Extension store.

## More resources:
1. Overview: https://developer.chrome.com/docs/extensions/mv3/overview/
2. Examples: https://github.com/GoogleChrome/chrome-extensions-samples
3. API Reference: https://developer.chrome.com/docs/extensions/reference/
