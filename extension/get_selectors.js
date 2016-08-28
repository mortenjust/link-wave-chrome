// populate linkSelector dictionary
var linkSelector = {}
linkSelector["hackernews.com"] = ".storylink"
linkSelector["twitter.com"] = ".twitter-timeline-link"
linkSelector["google.com"] = "div.rc h3.r a"
linkSelector["usepanda.com"] = "div.text-entry-content h2.article-title a.article-title-link"
linkSelector["designernews.co"] = "a.montana-item-title"
linkSelector["b.googleplex.com"] = "TODO:"
linkSelector["inc.com"] = "div div div p a"
linkSelector["reddit.com"] = "p.title a.title.may-blank.outbound"
linkSelector["producthunt.com"] = "a[target=_blank].button_2I1re"

var domain = window.location.href.match(/:\/\/(.[^/]+)/)[1]
var selectorForDomain = linkSelector[domain]

console.log("get_selectors.js now passing back "+selectorForDomain) 

selectorForDomain // will be passed to the calling script