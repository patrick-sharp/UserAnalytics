window.onload = async function() {

  // retrieve category keys from Chrome storage
  getCategoryKeys().then(data => {
    var selector = document.getElementById("category_selector");
    data.forEach(category => {
      var option = document.createElement("option");
      option.text = category;
      option.value = category;
      option.style.width = 'fit';
      selector.appendChild(option);
    })
  });

  // add `click` event listener to DOM 
  document.getElementById("save").addEventListener('click', function() {
    let selector = document.getElementById('category_selector');
    let index = selector.selectedIndex;
    let item = selector.options[index].value;
    let url = document.getElementById("url").innerHTML;
    alert(url);
    addLinkToCategory(item,url);
  })
  
  document.getElementById("trackingToggle").checked = await getTrackingStatus();
  changeOnOffText();

  document.getElementById("trackingToggle").addEventListener('change', function() {
    changeOnOffText();
    toggleTracking();
  })
}

function changeOnOffText() {
  if (document.getElementById("trackingToggle").checked) {
    var onoff = document.getElementById("tracking_onoff");
    onoff.innerHTML = "ON";
    onoff.style.color = "#5AC43B";
  } else {
    var onoff = document.getElementById("tracking_onoff");
    onoff.innerHTML = "OFF";
    onoff.style.color = "#CCC";
  }
}

/**
 * Add `DOMContentLoaded` listener
 */
document.addEventListener('DOMContentLoaded', function () {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    (function () {
      var ln = links[i];
      var location = ln.href;
      ln.onclick = function () {
        chrome.tabs.create({active: true, url: location});
      };
    })();
  }
});

// check the current active url every 1 second
window.setInterval(checkBrowserFocus, 1000);  

/**
 * Check the currently visited domain site and update the domain name in popup
 */
function checkBrowserFocus(){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    if (tabs[0]) {
      const url = new URL(tabs[0].url)
      document.getElementById("url").innerHTML = url.hostname;
    }
  });
}