# User Analytics Developer guide

## How to obtain the source code:
Clone or Fork this repository.

## Repository Layout
### Reports
This folder is for weekly status reports. It contains a markdown template file for future status reports.

### src
This folder contains our Chrome extension, upload this folder to Google Chrome to install UserAnalytics.

## Build & Test System
- The system will be automatically built when Chrome loads the folder. 
- Note that 'manifest.json' contains the set-up information for chrome extensions.
- Pushing code to the ‘main’ branch of our GitHub repository or opening a pull request to the ‘main’ branch will trigger a CI build. CI testing can also be manually triggered from GitHub’s actions tab.

## How to add new tests

## How to build a release of the software.


## More resources:
1. Overview: https://developer.chrome.com/docs/extensions/mv3/overview/
2. Examples: https://github.com/GoogleChrome/chrome-extensions-samples
3. API Reference: https://developer.chrome.com/docs/extensions/reference/