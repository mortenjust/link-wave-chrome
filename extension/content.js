console.log("prefetcher: We have a matching site")

// TODO: add all the other styles here, preferably from a shared store
document.querySelectorAll('.storylink').forEach((elm) => {

	// prefetch the dns	 
	var elmDns = document.createElement('link')
	var r = /:\/\/(.[^/]+)/;
	elmDns.setAttribute("rel", "dns-prefetch")
	elmDns.setAttribute("href", elm.href.match(r)[1])
	document.getElementsByTagName('head')[0].appendChild(elmDns);	

	// prefetch 
	var elmPrefetch = document.createElement('link')
	elmPrefetch.setAttribute("rel", "prefetch")
	elmPrefetch.setAttribute("href", elm.href)
	document.getElementsByTagName('head')[0].appendChild(elmPrefetch);

	// insert prerender 
	var elmLinkRel = document.createElement('link')
	elmLinkRel.setAttribute("rel", "prerender")
	elmLinkRel.setAttribute("href", elm.href)
	document.getElementsByTagName('head')[0].appendChild(elmLinkRel);
	


	// the user clicked a link. 
	elm.onclick = function(){ 
		console.log("onclick on a link detected. Sending a message")
		chrome.runtime.sendMessage({
			message: "openLink", 
			tabId: elm.dataset.tabId
		}, 
		function(response) {
			
		});
		return false; }
	
})

