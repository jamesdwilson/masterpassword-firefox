# masterpassword-firefox
Master Password implemented as a Firefox extension

[addons.mozilla.org entry](https://addons.mozilla.org/en-US/firefox/addon/masterpassword-firefox/)


This is a firefox addon implementing the masterpassword algorithm invented by Maarten Billemont. You can visit his website at [masterpasswordapp.com](http://masterpasswordapp.com). This plugin uses tmthrgd's [mpw library](https://github.com/tmthrgd/mpw-js), a javascript implementation of Maarten's algorithm.

**Please note that this plugin is not affiliated with Maarten or tmthrgd**

# Installation
Just click the xpi from the releases page. Firefox should ask if you want do install it. Release on the mozilla addons store is pending.

# Privacy mode
This addon is marked as respecting privacy mode.  When used from a private window no username or site settings will be stored. (note that settings -> privacy -> "firefox will never remember history" makes all your browsing considered private)

# Changing the site name
Many sites (like google) have localized url's (google.de, google.co.uk etc). It is recommended that you use the global (ie google.com) as the site name in such cases.

When you first open masterpassword on a localized domain, that domain will be suggested in masterpassword. You can change this. It will be remembered for your next visit.

If you have several accounts at a domain, it is suggested to prefix the site name with something like "username@" (ie myself@google.com). The site name in masterpassword will change to a dropdown if you have multiple variants.
