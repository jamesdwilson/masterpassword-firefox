var buttons = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
const {Cc,Ci} = require("chrome");
var ss = require("sdk/simple-storage");

var session_store = {'username':null,'masterkey':null};
console.log('storage contains:'+ss.storage.username);
if (ss.storage.username) session_store.username = ss.storage.username;

var button = buttons.ToggleButton({
    id: "com_github_ttyridal_masterpassword",
    label: "Master Password",
    icon: {
        "16": "./icon16.png",
        "32": "./icon32.png",
        "64": "./icon64.png"
    },
    onChange: function(state){
        if (state.checked) {
            var panel = createPanel();
            panel.show({position: button});
            panel.port.emit("popup", session_store);
        }
    }
});

function createPanel() {
    var panel = panels.Panel({
        width:360,
        height:310,
        contentURL: self.data.url("main_popup.html"),
        onHide: function(){
            button.state('window', {checked: false});
            panel.destroy();
        }
    });

    panel.port.on('store_update', function(d){
        session_store = d;
        ss.storage.username = d.username;
    });
    panel.port.on('to_clipboard', function(d){
        const gClipboardHelper = Cc["@mozilla.org/widget/clipboardhelper;1"]
                                       .getService(Ci.nsIClipboardHelper);
        gClipboardHelper.copyString(d);
    });
    panel.port.on('get_tab_url', function(d){
        panel.port.emit('get_tab_url_resp', tabs.activeTab.url);
    });
    return panel;
}
