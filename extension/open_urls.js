console.log("open_urls launched")

//// main
let maxTabs = 10
let autoOpen = false
var tabsOpened = 0

// main --------------------------------------------------

getPreferences(function(items){
		maxTabs = items.maxTabs;
		autoOpen = items.autoOpen;
		console.log("We have maxTabs of "+maxTabs)

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
		console.log("got response:", response)
		// add the tabId to the element of elm
		elm.dataset.tabId = response.tab.id

		// add onClick handler to go to the tab instead
		// TODO: check if the tab is still there, if not open blank
		// maybe do that in the background script instead
		elm.onclick = function(){
			console.log("elm clicked")
			chrome.runtime.sendMessage(
				{
					message:"openLink",
					tabId: elm.dataset.tabId
				},
				function(response){
					// done selecting tab
				}
			)
			return false; // return true if tab not there
		}
	});
}
