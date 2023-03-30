'use strict';
import Browser from './browser';

function send(action, data = {}, tabId)
{
    const message = { action, data };
    if (tabId) Browser.sendMessageToTab(tabId, message);
    else Browser.sendMessage(message);
}

function listen(callback)
{
    const listener = (message, sender, sendResponse) => 
    {
        sendResponse({});
        callback(message, sender);
        return true;
    }

    chrome.runtime.onMessage.addListener(listener);
    return listener;
}

function neglect(listener)
{
    chrome.runtime.onMessage.removeListener(listener);
}

export default { send, listen, neglect };