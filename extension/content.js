console.log("prefetcher: We have a matching site")

// populate linkSelector dictionary
// duplicated in open_urls <<<<<------------------
// put this in the backgroundscript instead and retreive with a message


var domain = window.location.href.match(/:\/\/(.[^/]+)/)[1]

// grab the selectors stored in the background script
chrome.runtime.sendMessage(
	{
		message:"getLinkSelectors",
		domain:domain
	},
	function(response){			
		console.log("back from background script. The selector for the domain is ")		
		console.log(response.selector)
		// now call prepare all 
		prepareAllContentLinksWithSelector(response.selector)
	}
)

function prepareAllContentLinksWithSelector(selector){
	document.querySelectorAll(selector).forEach((elm) => {
		console.log("preparing link: "+elm.innerText)

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
		
		
	})
}
