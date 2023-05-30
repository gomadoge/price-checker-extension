chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.gtin && request.country) {
    const url = `https://products.dm.de/product/${request.country}/products/gtins/${request.gtin}`

    fetch(url)
      .then(response => response.json())
      .then(json => sendResponse({ found: true, price: json[0].price }))
      .catch(_ => sendResponse({ found: false }));

    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, _) => {
  if (changeInfo.status === "complete") {
    chrome.tabs
      .sendMessage(tabId, { message: 'refreshPrice', })
      .catch(_ => { });
  }
});
