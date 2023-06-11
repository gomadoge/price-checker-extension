function getElementByXpath(path) {
  const snapshot = document.evaluate(path, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  return [...Array(snapshot.snapshotLength)].map((_, i) => snapshot.snapshotItem(i));
}

async function fetchPrice(gtin, country) {
  try {
    const response = await new Promise(resolve => {
      chrome.runtime.sendMessage({ gtin: gtin, country: country }, resolve);
    })

    return (response && response.found) ? response.price : null;
  } catch {
    return null;
  }
}

function getGtin() {
  const match = document.location.href.match(".*-p(\\d*).html");

  return (match && match.length == 2) ? match[1] : null;
}

function getPriceElement() {
  // Oh Lawd He Comin'
  const xpathPriceElement = "/html/body/div[2]/div/main/div[2]/div[2]/div[1]/div/div/div/div/div[1]/div[2]/div[2]/div/div[1]/div[1]/div[1]/div/span";
  return getElementByXpath(xpathPriceElement)[0];
}

async function refreshPrice() {
  const priceElement = getPriceElement();

  if (priceElement && !priceElement.innerText.includes("DE:")) {
    const gtin = getGtin();

    if (gtin) {
      const priceGermany = await fetchPrice(gtin, "de") ?? "N/A";

      priceElement.innerText = "AT: " + priceElement.innerText + " DE: " + priceGermany + " €";
    }
  }
}

chrome.runtime.onMessage.addListener(async function (request, _, _) {
  if (request.message === 'refreshPrice') {
    window.setTimeout(async () => {
      await refreshPrice();
    }, 1000);
  }
});
