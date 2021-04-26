// check the current active url every 1 second
window.setInterval(checkBrowserFocus, 1000);  

function checkBrowserFocus(){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    const url = new URL(tabs[0].url)
    document.getElementById("url").innerHTML = "VISITING:" + url.hostname
});
}


