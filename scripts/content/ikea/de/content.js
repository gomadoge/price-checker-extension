function getPriceElement() {
  return document.getElementsByClassName("pip-temp-price")[0];
}

function extractPriceFromText(text) {
  const regex = /"price":\w*\["([^"]*)"],/;
  console.log(regex.exec(text))
  return regex.exec(text)[1];
}

async function fetchPrice(url) {
  try {
    const response = await new Promise(resolve => {
      chrome.runtime.sendMessage({ url: url }, resolve);
    })

    return (response && response.found) ? extractPriceFromText(response.text) : null;
  } catch {
    return null;
  }
}

async function getLocalPrice() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/helper/extract_utag_data.js");
  document.head.appendChild(script);

  return new Promise(resolve => {
    window.addEventListener("message", ({data}) => {
      if (data.id != "price-checker-data") return;
      resolve(data.price);
    }, false);
  });
}

async function refreshPrice() {
  const localPrice = await getLocalPrice();
  const otherPriceAT = await fetchPrice(document.location.href.replace("/de/de", "/at/de"));
  const otherPriceSK = await fetchPrice(document.location.href.replace("/de/de", "/sk/sk"));

  if (localPrice) {
    const priceElement = getPriceElement();
    priceElement.innerHTML = "DE: € " + localPrice + " <br /> AT: € " + (otherPriceAT ?? "N/A") + " <br /> SK: € " + (otherPriceSK ?? "N/A");
  }
}

chrome.runtime.onMessage.addListener(async function (request, _, _) {
  if (request.message === 'refreshPrice') {
    window.setTimeout(async () => {
      await refreshPrice();
    }, 1000);
  }
});
