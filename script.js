chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request == "Action") {
        main();
    }
});
function main(){
    insert_link_element('script', 'tweet_data_script.js');
}
function insert_link_element(tag, insert_path, id = ''){
    if (id !== '') {
        if (document.getElementById(id) !== null) return;
    }
    var url, elt = null;
    switch (tag.toLowerCase()){
        case 'css':
            url=chrome.extension.getURL(insert_path);
            elt = document.createElement('link');
            elt.href=url;
            elt.rel = 'stylesheet';
        break;
        case 'script':
            url=chrome.extension.getURL(insert_path);
            elt = document.createElement('script');
            elt.src = url;
            elt.type = 'text/javascript';
        break;
    }
    if (elt !== null) {
        if (id !== '') elt.id = id;
        document.querySelector('head').appendChild(elt);
    }
}