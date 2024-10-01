let lastActiveTabId = -1;
const defaultTimeout = 5 * 60 * 1000; // 5 minutes

chrome.tabs.onActivated.addListener(setAutoCloseInTime);


async function setAutoCloseInTime(tab) {
    if (lastActiveTabId !== -1 && await doesTabExist(lastActiveTabId)) {
        // get last tab by id
        const lastActiveTab = await chrome.tabs.get(lastActiveTabId);
        const timeout = await getTimeoutTime();
        let tabInfo = {
            // create a new tab info object with a setTimeoutId of a setTimeout that will close the tab, tabId and url
            tabId: lastActiveTab.id,
            url: lastActiveTab.url,
            setTimeoutId: setTimeout(() => {
                cleanupTab(lastActiveTab.id);
                console.log('timeout for tab of URL: ' + lastActiveTab.url + ' and id ' + lastActiveTab.id + ' has been reached');
            }, timeout)
        };
        console.log('Tab of URL: ' + tabInfo.url + ' will be closed in ' + timeout + ' ms, at ' + new Date(Date.now() + timeout));
        // save tabInfo to storage
        await addTabInfoToStorage(tabInfo);
    }
    await cancelTabTimeout(tab.tabId);

    // set lastActiveTabId to the current
    lastActiveTabId = tab.tabId;

}


async function cancelTabTimeout(tabId) {
    await chrome.storage.local.get([tabId.toString()]).then((result) => {
        const tab = result[tabId]
        if (tab?.setTimeoutId) {
            console.log('Tab of URL: ' + tab.url + ' and id ' + tabId + ' will not be closed');
            clearTimeout(tab.setTimeoutId);
        }
    });
}

async function addTabInfoToStorage(tabInfo) {
    chrome.storage.local.set({[tabInfo.tabId]: tabInfo}).then(() => {
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

async function cleanupTab(tabId) {
    // todo - strategy pattern here for different cleanup methods
    chrome.tabs.remove(tabId);

}

function getTimeoutTime() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("timeout", function (data) {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            let timeout = data.timeout.timeout || defaultTimeout; // Use default timeout if not defined
            console.log("Timeout:", timeout);
            resolve(timeout);
        });
    });
}
