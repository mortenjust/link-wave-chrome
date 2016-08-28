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
          var tabId = parseInt(s.tabId)
          chrome.tabs.update(tabId, {selected:true}, function(tab){
              console.log("what happens if this tab is not there?")
              if(tab == null){
                console.log("that tab is null, we should msg back or JUST open the link in a new tab")
              }
          })
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
  console.log("bg getselectorfordomain")
  var linkSelector = {}
  linkSelector["news.ycombinator.com"] = ".storylink"
  linkSelector["twitter.com"] = ".twitter-timeline-link"
  linkSelector["google.com"] = "div.rc h3.r a"
  linkSelector["usepanda.com"] = "div.text-entry-content h2.article-title a.article-title-link"
  linkSelector["designernews.co"] = "a.montana-item-title"
  linkSelector["b.googleplex.com"] = "TODO:"
  linkSelector["inc.com"] = "div div div p a"
  linkSelector["reddit.com"] = "p.title a.title.may-blank.outbound"
  linkSelector["producthunt.com"] = "a[target=_blank].button_2I1re"
	console.log("background: getting link selector for "+domain)
	return linkSelector[domain]
}

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
