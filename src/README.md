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
- To run UI tests, there is a javascript file in the `src` diectory called `dashboard_test.js`. If this file is included via script tag at the bottom of the `dashboard.html` (also in the `src` directory), UI tests will automatically be run when you open up the dashboard while using the extension.

## How to add new tests
You can add new tests for the middleware functions by going into the file `test.js` in the `test` folder. This file contains an array at the top called `testFunctions`. Each function in this file is a test for our middleware functions (found in `src/middleware.js`). Each one of these functions returns true if the test passes, and false if it fails. The tests in the file are run automatically by a GitHub action when main is pushed to, or when a pull request to main is opened.

You can add new UI tests to `src/dashboard_test.js` in a similar way. `src/dashboard_test.js` has an array of functions called `testFunctions` defined at the top of the file. Like the functions in `test/test.js`, they return true on a passing test and false on a failing test. To add a UI test, add a function to that array and it will automatically run whenever the `src/dashboard_test` file is included via script tag at the bottom of `src/dashboard.html`.

## How to build a release of the software.
Again the system automatically builds when Chrome loads the extension. In the future the may be releases on the Chrome Extension store.

## More resources:
1. Overview: https://developer.chrome.com/docs/extensions/mv3/overview/
2. Examples: https://github.com/GoogleChrome/chrome-extensions-samples
3. API Reference: https://developer.chrome.com/docs/extensions/reference/
