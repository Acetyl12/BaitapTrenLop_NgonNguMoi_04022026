const API_URL = "https://api.escuelajs.co/api/v1/products";

function fetchProductsApi() {
  return fetch(API_URL).then(response => response.json());
}

function updateProductApi(id, body) {
  return fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).then(response => response.json());
}

function createProductApi(body) {
  return fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).then(response => response.json());
}

export { fetchProductsApi, updateProductApi, createProductApi };

