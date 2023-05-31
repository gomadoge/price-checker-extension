if (utag_data && utag_data.price) {
  const message = { "id": "price-checker-data", "price": utag_data.price[0] };
  window.postMessage(message, "*");
}

window.postMessage({ "id": "price-checker-data" }, "*");
