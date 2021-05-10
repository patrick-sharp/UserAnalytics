# UserAnalytics

UserAnalytics is a chrome extension which tracks how much time a user spends on different websites and presents that data to the user in various pleasingly data visualizations.

## Goals
UserAnalytics has 5 main features that we aim to develop in 8 weeks.
1. User can visualize usage for each domain with a running average
2. User can visualize usage for each day of the week in hours with a running average
3. User can configure white/blacklist for which domain tracking
4. Extension categories time spent automatically (social media, reading/reference, and productivity)
5. User can visualize time spent per category of websites for each day of the week with a running average.

There are additional strech goals as well.
- Focus/Relax mode that can be suggested on/off based on user actions (ML) or manually turned on
- User can work with more advanced data visualizations for specific websites
- Block sites at certain times, set time limits for certain sites


## How to Install UserAnalytics
1. Clone this repository
2. Navigate to chrome://extensions in your browser. You can also access this page by clicking on the Chrome menu on the top right side of the Omnibox, hovering over **More Tools** and selecting **Extensions**.
3. Check the box next to **Developer Mode**.
4. Click **Load Unpacked Extension** and select the **src** folder in this repository.

## Build & Test System
- The system will be automatically built when Chrome loads the folder. Note that 'manifest.json' contains the set-up information for chrome extensions.

- Pushing code to the ‘main’ branch of our GitHub repository or opening a pull request to the ‘main’ branch will trigger a CI build. CI testing can also be manually triggered from GitHub’s actions tab.


## Repository Layout
### Reports
This folder is for weekly status reports. It contains a markdown template file for future status reports.

### src
This folder contains our Chrome extension, upload this folder to Google Chrome to install UserAnalytics.
