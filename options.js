// Get the timeout value from chrome.storage and set it in the input field
chrome.storage.local.get("timeout", function (data) {
    if (data.timeout) {
        const timeoutNumeric = data.timeout.timeout / 60 / 1000;
        document.getElementById("timeout").value = timeoutNumeric;
    }
});

// Handle form submit
document.getElementById("options-form").addEventListener("submit", function (event) {
    event.preventDefault();
    let timeout = document.getElementById("timeout").value * 60 * 1000;
    // Zapisz wartość timeoutu w chrome.storage
    chrome.storage.local.set({"timeout": {timeout: timeout}}, function () {
        console.log("Timeout saved:" + timeout + " [ms]");
    });
});