// check the current active url every 2 seconds
window.setInterval(checkBrowserFocus, 2000);  

function checkBrowserFocus(){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    const url = new URL(tabs[0].url)
    document.getElementById("url").innerHTML = "VISITING:" + url.hostname
});
}


