chrome.runtime.onInstalled.addListener(function() {
  console.log("eventPage: adding stuff now")
  var id = chrome.contextMenus.create({"title": "Open selected links in new tabs",
                                     "contexts":["selection"],
                                     "id": "selection"})

	chrome.contextMenus.onClicked.addListener(onContextClick);

  console.log("eventPage: Adding listener now") 
	chrome.runtime.onMessage.addListener(
    function(s, sender, sendResponse){
      console.log("bg: got message"+s.message)
      //debug
      // sendResponse({message:"here we are"})

      if(s.message == "openTab"){
            openTab(s.url, function(tab){
              // we know we have tab.id here
              console.log("sendresponse:", tab.id)
              sendResponse({tab: tab})
            });
          return true
          }

        if(s.message == "openLink"){
          var tabId = parseInt(s.tabId)
          chrome.tabs.update(tabId, {selected:true}, function(tab){    
              console.log("got this tab back:", tab)      
              if(tab == null){
                console.log("Tab not there, sending message back", sendResponse)
                sendResponse({tabStillOpen:false})
              } else {
                sendResponse({tabStillOpen:true})
              }
          })
          return true
        }

        if(s.message == "maybeAutoLaunch"){
            maybeAutoLaunch()
        }

        if(s.message == "getLinkSelectors"){
            console.log("bg: getLinkSelectors")
            var domain = s.domain
            var selector = getSelectorForDomain(domain)
            console.log("bg: sending back selector: "+selector)
            sendResponse({selector:selector})
        }
	})

function getSelectorForDomain(domain){
  console.log("bg getselectorfordomain: "+domain)
  var linkSelector = {}
  linkSelector["news.ycombinator.com"] = ".storylink"
  linkSelector["twitter.com"] = ".twitter-timeline-link"
  linkSelector["www.google.com"] = "div.rc h3.r a"
  linkSelector["usepanda.com"] = "div.text-entry-content h2.article-title a.article-title-link"
  linkSelector["www.designernews.co"] = "a.montana-item-title"
  linkSelector["b.googleplex.com"] = "TODO:"
  linkSelector["inc.com"] = "div div div p a"
  linkSelector["www.reddit.com"] = "p.title a.title.may-blank.outbound"
  linkSelector["www.producthunt.com"] = "a[target=_blank].button_2I1re"
	console.log("bg: link selector for "+domain+" is "+linkSelector[domain])
	return linkSelector[domain]
}

function selectTab(tabId){
  chrome.tabs.update(tabId, {selected:true});
}

function onContextClick(info, tab) {
    launchAllTabs()
};

function launchAllTabs(){
  chrome.tabs.executeScript(null,
       {file:"open_urls.js"},
       function(res){
       });
}

function openTab(url, callback){
    var createProps = { url:url, active:false }
     chrome.tabs.create(createProps, function(tab){
        callback(tab)
      })
  }

function countOpenTabsInCurrentWindow(callback){
  chrome.tabs.query(
    {
      currentWindow:true
    }, function(res){            
      callback(res.length)
    })
}

function maybeAutoLaunch(){
  getPreferences(function(items){
     if(items.autoOpen){
       console.log("bg, yes do auto open")
       countOpenTabsInCurrentWindow(function(count){
         console.log("there are tabs:"+count)
         if(count==1){
            launchAllTabs()
          }
       })
     }
  })

}

function getPreferences(callback){
	chrome.storage.sync.get({
		maxTabs: 10,
		autoOpen: false
	}, function(items) {		
		callback(items)
	});
}



}); // oninstalled listener
