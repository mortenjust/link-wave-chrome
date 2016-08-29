console.log("popup.js launched")

document.addEventListener('DOMContentLoaded', function () {
  console.log("ready to execute")

  chrome.tabs.executeScript(null,
       { 
         file:"open_urls.js"
        }, 
       function(res){
       });

  window.close()

});