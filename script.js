chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request == "Action") {
        main();
    }
});
function main(){
    var insert_script_path="tweet_data_script.js"
    var url=chrome.extension.getURL(insert_script_path);
    var elt = document.createElement("script");
    elt.src=url;
    document.head.appendChild(elt);
}
