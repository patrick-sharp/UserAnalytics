window.onload = function() {

  // test loading category data async
  // let b = chrome.storage.sync.get(["category"], function(data) {
  //   console.log("data " + JSON.stringify(data));
  // })

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

  document.getElementById("save").addEventListener('click', function() {
    let selector = document.getElementById('category_selector');
    let index = selector.selectedIndex;
    let item = selector.options[index].value;
    let url = document.getElementById("url_editor").innerHTML;
    console.log("saved");
    addLinkToCategory(item,url);
  })
}

  // var selector = document.getElementById("category_selector");
  // Categories.forEach(category => {
  //    var option = document.createElement("option");
  //    option.text = category;
  //    option.value = category;
  //    option.style.width = 'fit';
  //    selector.appendChild(option);
  // })



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

function checkBrowserFocus(){
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    if (tabs[0]) {
      const url = new URL(tabs[0].url)
      document.getElementById("url").innerHTML = "Currently Visiting: " + url.hostname;
      document.getElementById("url_editor").innerHTML = url.hostname;
    }
  });
}