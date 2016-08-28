console.log("open_urls launched")

//// main
let maxTabs = 10
let autoOpen = false
var tabsOpened = 0

function getPreferences(callback){
	chrome.storage.sync.get({
		maxTabs: 10,
		autoOpen: false
	}, function(items) {		
		callback(items)
	});
}

getPreferences(function(items){
		maxTabs = items.maxTabs;
		autoOpen = items.autoOpen;
		console.log("We have maxTabs of "+maxTabs)

		var s = window.getSelection()
		if (s.isCollapsed) {	
			handleKnownSites()
		} else {
			handleSelection(s)
		}
})

////////

function handleSelection(s){


	for (var i = 0; i < document.links.length; i++) {
		var l = document.links[i]
		if(s.containsNode(l)){			 
			openTab(l)			
		}
	}
}

function handleKnownSites(){
	for (var i = 0; i < document.links.length; i++) {
		var l = document.links[i]
		if(isHackernews(l)  
			|| isProductHunt(l)  
			|| isTwitter(l)  
			|| isDesignerNews(l)  
			|| isReddit(l) 
			|| isPanda(l)
			|| isMedium(l)
			|| isInc(l)
			|| isAllTop(l)
			|| isGoogle(l)
			|| isBuganizer(l)
			){

		if (tabsOpened++ < maxTabs){
			openTab(l)
		}	
	}
	}
}

//// 


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

// Site-specific 

function isHackernews(l){
	if(l.className!="storylink"){
		return false
	}
	return true
}

function isTwitter(l){
	if(!l.className.includes("twitter-timeline-link")){
		return false
	}
	return true
}

function isGoogle(l){
	if(!(l.parentNode.className=="r"  && l.parentNode.nodeName=="H3")){
		return false
	}
	return true
}


function isAllTop(l){
	if(l.parentElement.className!="entry-title"){
		return false
	}
	return true
}

function isPanda(l){
	if(l.className!="article-title-link"){
		return false
	}
	return true
}


function isDesignerNews(l){
	if(l.className != "montana-item-title"){
		return false
	}
	return true
}


function isMedium(l){
	if( !l.className.includes("markup--anchor")){
		return false
	}
	return true
}

function isBuganizer(l){
	if( !l.className.includes("row-issue-title")){
		return false
	}
	return true
}

function isInc(l){
	if(!l.offsetParent){return false}
	if(!l.offsetParent.className.includes("article-body")){
		return false
	}
	return true
}

function isReddit(l){
	if(l.className != "title may-blank outbound "){
		return false
	}
	return true
}

function isProductHunt(l){
	if(l.className!="button_2I1re smallSize_1da-r secondaryText_PM80d subtleVariant_tlhj3 simpleVariant_1Nl54 button_2n20W"){
		return false
	}
	if(l.innerText != ""){
		return false
	}
	return true
}
