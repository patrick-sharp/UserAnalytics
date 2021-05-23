window.onload = function() {

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
    let url = document.getElementById("url_editor").innerHTML;
    addLinkToCategory(item,url);
  })
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
      document.getElementById("url").innerHTML = "Currently Visiting: " + url.hostname;
      document.getElementById("url_editor").innerHTML = url.hostname;
    }
  });
}