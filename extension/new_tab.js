

console.log("hello from new_tab.js. Sending message!")

chrome.runtime.sendMessage(
    {
        message:"newTabOpened",
        url:document.location.href
     }, 
     function(response){
        console.log("got response after message", response)
        if(response.goForward){
            window.history.forward()
        }
     }
)