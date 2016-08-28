

chrome.runtime.onInstalled.addListener(function() {
  console.log("eventPage: adding stuff now")
  var id = chrome.contextMenus.create({"title": "Open selected links in new tabs",
                                     "contexts":["selection"],
                                     "id": "selection"})
	chrome.contextMenus.onClicked.addListener(onContextClick);




  console.log("eventPage: Adding listener now") // -----------
	chrome.runtime.onMessage.addListener(
    function(s, sender, sendResponse){

      //debug
      // sendResponse({message:"here we are"})

      if(s.message == "openTab"){
          		window.setTimeout(function(){
                  openTab(s.url, function(tab){
                    // we know we have tab.id here
                    console.log("sendresponse:", tab.id)
                    sendResponse({tab: tab})
                  });
          		}
          			, 1000);
          return true
          }

        if(s.message == "openLink"){
          console.log("backgroundjs: openLink")
          console.log("the tab id stored in the tag is "+s.tabId)

//          var tabId = s.tabId.parseInt

          // selectTab(tabId)

          var tabId = parseInt(s.tabId)
          chrome.tabs.update(tabId, {selected:true})

          // is there a tabId in the dataset?
          // is that tab still around?
          // yes, switch to that tab, sendResponse true
          // no, sendResponse false
        }

	})


function selectTab(tabId){
  chrome.tabs.update(tabId, {selected:true});
}

function onContextClick(info, tab) {
    chrome.tabs.executeScript(null,
       {file:"open_urls.js"},
       function(res){
       });
};


function openTab(url, callback){
    var createProps = { url:url, active:false }
     chrome.tabs.create(createProps, function(tab){
        callback(tab)
      })
  }

});
