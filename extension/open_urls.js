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
	/// also install onclick on each. See how tthat's done in content.js
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
			openTabsForAllLinksWithSelector(selector)
		}
	)
}

function openTabsForAllLinksWithSelector(selector){	
	document.querySelectorAll(selector).forEach((elm) => {
		if (tabsOpened++ < maxTabs){
			openTab(l)
		}	
	})
}


function openTab(l){
	console.log("openTab in open_urls sending message")
	chrome.runtime.sendMessage(
		/// tabid here? , 		
		{
		message:"openTab", 
		url: l.href
	}, 
	function(response) {	
		if (chrome.runtime.lastError) {                            
				console.log("ERROR: ", chrome.runtime.lastError);
		}
		console.log("got response:", response)
		// add the tabId to the element of l
		l.dataset.tabId = response.tab.id
	});
}
