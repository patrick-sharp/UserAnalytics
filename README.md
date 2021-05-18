# UserAnalytics

UserAnalytics is a chrome extension which tracks how much time a user spends on different websites and presents that data to the user in various pleasingly data visualizations.

## Install & Run UserAnalytics
1. Clone this repository to your PC.
2. Navigate to chrome://extensions in your browser. You can also access this page by clicking on the Chrome menu on the top right side of the Omnibox, hovering over **More Tools** and selecting **Extensions**.
3. Check the box next to **Developer Mode**.
4. Click **Load Unpacked Extension** and select the **src** folder in this repository.

## How to use UserAnalytics
- Using Chrome as normal. Our app will automatically track your usage. 
- By clicking the "Go to dashboard" button on the popup page, you can view the usage data on the dashboard.
- You can set the category of the webpage you are currently visiting on the popup page.
- The dashboard page contains options for personalized settings.


## How to report a bug

## WIP Functionalities and Known bugs
- [ ] User unable to make deletions to their whitelist.
- [ ] The website/domain icons are not presented along with the domain name (currently it is a timer icon).
- [ ] The activity chart doesn't support reviewing data up to 14 days ago.
- [ ] The category chart needs unit when hovering. Categories should be displayed according to the order in descending order and the colors should match categories. 
- [ ] Do not track extension URL and new tab.
- [ ] Differentiate subdomain from their parent domains.
- [ ] Update extension popup UI.
- [ ] Missing title for the right chart.