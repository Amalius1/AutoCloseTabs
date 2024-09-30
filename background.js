let lastActiveTabId = -1;
chrome.tabs.onActivated.addListener(setAutoCloseInTime);

const defaultTimeout = 5 * 60 * 1000;

async function setAutoCloseInTime(tab) {
    if (lastActiveTabId !== -1 && await doesTabExist(lastActiveTabId)) {
        // get last tab by id
        const lastActiveTab = await chrome.tabs.get(lastActiveTabId);

        let tabInfo = {
            // create a new tab info object with a setTimeoutId of a setTimeout that will close the tab, tabId and url
            tabId: lastActiveTab.id,
            url: lastActiveTab.url,
            setTimeoutId: setTimeout(() => {
                chrome.tabs.remove(lastActiveTab.id);
                // console.log('Tab closed: ' + lastActiveTab.id + ' ' + lastActiveTab.url);
            }, defaultTimeout) // 5 minutes
        };
        console.log('Tab of URL: ' + tabInfo.url + ' will be closed in 5 minutes, at ' + new Date(Date.now() + defaultTimeout));
        // save tabInfo to storage
        addTabInfoToStorage(tabInfo);
    }
    await cancelTabTimeout(tab.tabId);

    // set lastActiveTabId to the current
    lastActiveTabId = tab.tabId;

}


async function cancelTabTimeout(tabId) {
    await chrome.storage.sync.get([tabId.toString()]).then((result) => {
        const tab = result[tabId]
        if (tab?.setTimeoutId) {
            console.log('Tab of URL: ' + tab.url + ' and id ' + tabId + ' will not be closed');
            clearTimeout(tab.setTimeoutId);
        }
    });
}

async function addTabInfoToStorage(tabInfo) {
    chrome.storage.sync.set({[tabInfo.tabId]: tabInfo}).then(() => {
        console.log('Tab of URL: ' + tabInfo.url + ' and id ' + tabInfo.tabId + ' added to storage');
    });
}

async function doesTabExist(tabId) {
    try {
        await chrome.tabs.get(tabId);
        return true; // Tab exists
    } catch (error) {
        return false; // Tab does not exist
    }
}