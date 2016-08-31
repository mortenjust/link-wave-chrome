console.log("open_urls launched")

//// main

	let maxTabs = 10
	let autoOpen = false
	var tabsOpened = 0
	var tabLoadStateListenerInstalled = false


// main --------------------------------------------------

getPreferences(function(items){
		maxTabs = items.maxTabs;
		autoOpen = items.autoOpen;
		console.log("We have maxTabs of "+maxTabs)
		listenForTabLoadState()
		var s = window.getSelection()
		if (s.isCollapsed) {	
			var domain = window.location.href.match(/:\/\/(.[^/]+)/)[1]
			openAllLinksOnDomain(domain)
		} else {
			handleSelection(s)
		}
		
})

/// functions -----------------------------------

function getPreferences(callback){
	chrome.storage.sync.get({
		maxTabs: 10,
		autoOpen: false
	}, function(items) {		
		callback(items)
	});
}

function handleSelection(s){
	/// TODO: also install onclick on each. See how tthat's done in content.js
	for (var i = 0; i < document.links.length; i++) {
		var l = document.links[i]
		if(s.containsNode(l)){						 
			openTab(l)			
		}
	}
}


// ---- set up listeners : THIS ONE NEVER CALLED

function listenForTabLoadState(){
// if this listener is already there, abort

	console.log("openurls:tabLoadStateListenerInstalled:"+tabLoadStateListenerInstalled)
	if(tabLoadStateListenerInstalled){return}

	console.log("openurls:installing onMessage listener")
	chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log("content script got a message", request)

		// 🙏 > 👉 > 👍
		// or ✊ > 👉 > 👍

		tabId = request.tabId
		switch (request.message) {
			case "tabLoading":
			// first create the sucker, then update it
				createStateIconForTabId(tabId)
				setStateIconForTabId(tabId, "✊")
				break;
			case "tabCompleted":
				setStateIconForTabId(tabId, "👉")
				break;			
			default:
				break;
		}
	});
}

function createStateIconForTabId(tabId){
			var stateEl = document.querySelector("[data-tab-id='"+tabId+"'] span")
			if(stateEl != null){return}
			
			var el = document.querySelector("[data-tab-id='"+tabId+"']")
			var newEl = document.createElement("span")
			el.insertBefore(newEl, el.firstChild)	
}

function setStateIconForTabId(tabId, icon){
			// grab the element, it's the span in the damn
			var stateEl = document.querySelector("[data-tab-id='"+tabId+"'] span")
			stateEl.innerText = icon
			console.log("crated this element", newEl)			
}

// -----

function openAllLinksOnDomain(domain){
	// grab the selectors stored in the background script
	chrome.runtime.sendMessage(
		{
			message:"getLinkSelectors",
			domain:domain
		},
		function(response){			
			console.log("back from background script. The selector for the domain is ")		
			console.log(response.selector)			
			openTabsForAllLinksWithSelector(response.selector)
		}
	)
}

function openTabsForAllLinksWithSelector(selector){	
	console.log("openTabsForAllLinksWithSelector:"+selector)
	document.querySelectorAll(selector).forEach((elm) => {
		if (tabsOpened++ < maxTabs){
			openTab(elm)
		}	
	})
}

function openTab(elm){
	console.log("openTab in open_urls sending message")
	chrome.runtime.sendMessage(
		/// tabid here? , 		
		{
		message:"openTab", 
		url: elm.href
	}, 
	function(response) {	
		if (chrome.runtime.lastError) {                            
				console.log("ERROR: ", chrome.runtime.lastError);
		}
		console.log("opentab/open-urls: got response:", response)
		// add the tabId to the element of elm
		elm.dataset.tabId = response.tab.id

		// TODO: check if the tab is still there, if not return false	
		elm.onclick = clickHandler 
	});

	function clickHandler(){
			var tabGone = false
			console.log("elm clicked")
			chrome.runtime.sendMessage(
				{
					message:"openLink",
					tabId: elm.dataset.tabId
				},
				function(response){
					console.log("resp: ", response)
					if(response.tabStillOpen==false){
						// tab gone, open a new one
						openTab(elm)										
					}
				}
			)	
			return false // suppress the link				
		}
}