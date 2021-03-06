var knownTabs = [];

chrome.runtime.onInstalled.addListener(function() {
  console.log("eventPage: adding stuff now")
  var id = chrome.contextMenus.create({"title": "Open selected links in new tabs",
                                     "contexts":["selection"],
                                     "id": "selection"})

	chrome.contextMenus.onClicked.addListener(onContextClick);
  
  chrome.tabs.onUpdated.addListener(tabUpdated);

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

        if(s.message == "newTabOpened"){
            // get the active tab            
            chrome.tabs.query({active:true, currentWindow:true}, function(thisTab){
                var t = thisTab[0]
                console.log("--newTabOpened. activeTab (mother):"+t.id)
                var m = knownTabs[t.id].motherId
                console.log("---its mother: ",m)
                if(m!==null){
                  console.log("SEND YOU BACK!")
                  chrome.tabs.update(m, {selected:true})                          
                  sendResponse({goForward:true})                  
                }
                else {
                  console.log("DON'T SEND YOU BACK")
                  sendResponse({goForward:false})
                }                
            })
            return true
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
  // open a temporary page to activate the back button
  console.log("bgjs:openTab")
chrome.tabs.query({active:true, currentWindow:true}, function(motherTabs){
    var motherTabId = motherTabs[0].id
    var newTabUrl = chrome.extension.getURL("new_tab.html")
    console.log("1. mothertabid"+motherTabId)
    var createProps = {url: newTabUrl,active:false, openerTabId:motherTabId, pinned:false}
     chrome.tabs.create(createProps, function(tab){
       window.setTimeout(function(){
        console.log("tab created, its url is "+tab.url+". now send to the right url")
        // tab created, now send it to the right url        
          var updateProps = { url:url, active:false }
          chrome.tabs.update(tab.id, updateProps, function(tab){
              // get current tab as mother tab, and insert into KnownTabs
                knownTabs[tab.id] = {motherId:motherTabId}
                console.log("2. knowntabs", knownTabs)
                callback(tab)
              
          })    // 4. update and actually go to the site we want
        }, 250) // 3. wait ms the back butto' won't show up unless this delay
      })        // 2. create tab   
    });         // 1. get current tab so we can put it into openerTabId/mother later
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

function tabUpdated(tabId, changeInfo, tab){
  var openerTab = tab.openerTabId       

  switch (changeInfo.status) {
    case "complete":
       chrome.tabs.sendMessage(openerTab, {tabId:tab.id, message:"tabCompleted", tab:tab})
      break;
    case "loading":
       chrome.tabs.sendMessage(openerTab, {tabId:tab.id, message:"tabLoading", tab:tab})
       break;
    default:
      break;
  }



  if(changeInfo.status == "complete"){
       console.log(tab.url+" just loaded. TODO: Send that info back to the parentTab")
       var openerTab = tab.openerTabId       
       chrome.tabs.sendMessage(openerTab, {tabId:tab.id, message:"tabCompleted", tab:tab})
    }
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
