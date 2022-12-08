'use strict';

function getURL(path)
{
    return chrome.runtime.getURL(path);
}

function sendMessageToTab(tabId, message)
{
    chrome.tabs.sendMessage(tabId, message);
}

function sendMessage(message)
{
    chrome.runtime.sendMessage(message); 
}

function openTab(path, opts={})
{
    chrome.tabs.create({url: path, ...opts});
}

async function captureVisibleArea() 
{
    try
    {
        const dataURI = await chrome.tabs.captureVisibleTab(null, {format: "png"});
        return dataURI;
    }
    catch (err)
    {
        throw err;
    }
}

const storage = {
    local: {
        store: async (data) => 
        {
            try { await chrome.storage.local.set(data); }
            catch (err) 
            { 
                console.log(err);
                throw err; 
            }
        },
        get: async (key) => 
        {
            try
            {
                const data = await chrome.storage.local.get([key]);
                if (data[key]) return data[key];
                else return null;
            }
            catch (err) 
            {
                console.log(err);
                throw err;
            }
        },
        remove: async (key) => 
        {
            try { await chrome.storage.local.remove([key]); }
            catch (err) 
            {
                console.log(err);
                throw err;
            }
        },
        clear: async () => 
        {
            try { await chrome.storage.local.clear(); }
            catch (err) 
            {
                console.log(err);
                throw err;
            }
        }
    }
};

export default {
    getURL,
    sendMessage,
    sendMessageToTab,
    openTab,
    captureVisibleArea,
    storage
};