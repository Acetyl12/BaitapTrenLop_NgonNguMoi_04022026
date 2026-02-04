const API_URL = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;
let sortField = null;
let sortDirection = "asc";
let currentDetailProductId = null;

const searchInput = document.getElementById("searchInput");
const pageSizeSelect = document.getElementById("pageSizeSelect");
const productsTbody = document.getElementById("productsTbody");
const pagination = document.getElementById("pagination");
const paginationInfo = document.getElementById("paginationInfo");
const sortTitleBtn = document.getElementById("sortTitleBtn");
const sortPriceBtn = document.getElementById("sortPriceBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const createBtn = document.getElementById("createBtn");

const detailModalElement = document.getElementById("detailModal");
const detailModal = new bootstrap.Modal(detailModalElement);
const detailModalTitle = document.getElementById("detailModalTitle");
const detailImage = document.getElementById("detailImage");
const detailExtraImages = document.getElementById("detailExtraImages");
const detailTitleInput = document.getElementById("detailTitle");
const detailPriceInput = document.getElementById("detailPrice");
const detailCategoryIdInput = document.getElementById("detailCategoryId");
const detailDescriptionInput = document.getElementById("detailDescription");
const detailImagesInput = document.getElementById("detailImages");
const detailModalStatus = document.getElementById("detailModalStatus");
const saveDetailBtn = document.getElementById("saveDetailBtn");

const createModalElement = document.getElementById("createModal");
const createModal = new bootstrap.Modal(createModalElement);
const createTitleInput = document.getElementById("createTitle");
const createPriceInput = document.getElementById("createPrice");
const createCategoryIdInput = document.getElementById("createCategoryId");
const createDescriptionInput = document.getElementById("createDescription");
const createImagesInput = document.getElementById("createImages");
const createModalStatus = document.getElementById("createModalStatus");
const createSubmitBtn = document.getElementById("createSubmitBtn");

function fetchProducts() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      products = Array.isArray(data) ? data : [];
      filteredProducts = products.slice();
      currentPage = 1;
      renderTable();
    })
    .catch(error => {
      console.error("Error fetching products", error);
    });
}

function applySearch() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    filteredProducts = products.slice();
  } else {
    filteredProducts = products.filter(p => {
      const title = (p.title || "").toLowerCase();
      return title.includes(query);
    });
  }
}

function applySort() {
  if (!sortField) {
    return;
  }
  const direction = sortDirection === "asc" ? 1 : -1;
  filteredProducts.sort((a, b) => {
    let aValue;
    let bValue;
    if (sortField === "title") {
      aValue = (a.title || "").toLowerCase();
      bValue = (b.title || "").toLowerCase();
    } else if (sortField === "price") {
      aValue = Number(a.price) || 0;
      bValue = Number(b.price) || 0;
    } else {
      return 0;
    }
    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });
}

function getPagedData() {
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = filteredProducts.slice(startIndex, endIndex);
  return { items, totalItems, totalPages, startIndex, endIndex };
}

function clearTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(triggerEl => {
    if (bootstrap.Tooltip.getInstance(triggerEl)) {
      bootstrap.Tooltip.getInstance(triggerEl).dispose();
    }
  });
}

function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(triggerEl => {
    new bootstrap.Tooltip(triggerEl);
  });
}

function renderTable() {
  applySearch();
  applySort();
  const { items, totalItems, totalPages, startIndex, endIndex } = getPagedData();

  clearTooltips();
  productsTbody.innerHTML = "";

  items.forEach(product => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-id", product.id);
    tr.setAttribute("data-bs-toggle", "tooltip");
    tr.setAttribute("data-bs-placement", "top");
    tr.setAttribute("data-bs-title", product.description || "");

    const idTd = document.createElement("td");
    idTd.textContent = product.id;

    const titleTd = document.createElement("td");
    titleTd.textContent = product.title;

    const priceTd = document.createElement("td");
    priceTd.textContent = product.price;

    const categoryTd = document.createElement("td");
    const categoryName = product.category && product.category.name ? product.category.name : "";
    categoryTd.textContent = categoryName;

    const imageTd = document.createElement("td");
    const img = document.createElement("img");
    const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "";
    img.src = imageUrl;
    img.alt = product.title || "";
    img.className = "img-thumbnail";
    img.style.maxWidth = "80px";
    img.style.maxHeight = "80px";
    imageTd.appendChild(img);

    tr.appendChild(idTd);
    tr.appendChild(titleTd);
    tr.appendChild(priceTd);
    tr.appendChild(categoryTd);
    tr.appendChild(imageTd);

    tr.addEventListener("click", () => {
      openDetailModal(product.id);
    });

    productsTbody.appendChild(tr);
  });

  initTooltips();

  const showingFrom = totalItems === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(endIndex, totalItems);
  paginationInfo.textContent = `Hiển thị ${showingFrom}-${showingTo} trên tổng ${totalItems}`;

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  pagination.innerHTML = "";

  const prevLi = document.createElement("li");
  prevLi.className = "page-item" + (currentPage === 1 ? " disabled" : "");
  const prevLink = document.createElement("a");
  prevLink.className = "page-link";
  prevLink.href = "#";
  prevLink.textContent = "Prev";
  prevLink.addEventListener("click", event => {
    event.preventDefault();
    if (currentPage > 1) {
      currentPage -= 1;
      renderTable();
    }
  });
  prevLi.appendChild(prevLink);
  pagination.appendChild(prevLi);

  for (let page = 1; page <= totalPages; page += 1) {
    const li = document.createElement("li");
    li.className = "page-item" + (page === currentPage ? " active" : "");
    const link = document.createElement("a");
    link.className = "page-link";
    link.href = "#";
    link.textContent = String(page);
    link.addEventListener("click", event => {
      event.preventDefault();
      if (currentPage !== page) {
        currentPage = page;
        renderTable();
      }
    });
    li.appendChild(link);
    pagination.appendChild(li);
  }

  const nextLi = document.createElement("li");
  nextLi.className = "page-item" + (currentPage === totalPages ? " disabled" : "");
  const nextLink = document.createElement("a");
  nextLink.className = "page-link";
  nextLink.href = "#";
  nextLink.textContent = "Next";
  nextLink.addEventListener("click", event => {
    event.preventDefault();
    if (currentPage < totalPages) {
      currentPage += 1;
      renderTable();
    }
  });
  nextLi.appendChild(nextLink);
  pagination.appendChild(nextLi);
}

function toggleSort(field) {
  if (sortField === field) {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortField = field;
    sortDirection = "asc";
  }
  renderTable();
}

function exportCurrentViewToCsv() {
  const { items } = getPagedData();
  const header = ["id", "title", "price", "category", "images"];
  const rows = items.map(p => {
    const categoryName = p.category && p.category.name ? p.category.name : "";
    const imagesJoined = Array.isArray(p.images) ? p.images.join(" | ") : "";
    return [
      p.id,
      p.title || "",
      p.price,
      categoryName,
      imagesJoined
    ];
  });

  const allRows = [header, ...rows];
  const csvLines = allRows.map(row => row.map(value => {
    if (value == null) {
      return "";
    }
    const stringValue = String(value);
    const needsQuotes = stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n");
    if (needsQuotes) {
      return "\"" + stringValue.replace(/"/g, "\"\"") + "\"";
    }
    return stringValue;
  }).join(","));

  const csvContent = csvLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.href = url;
  link.download = `products_page_${currentPage}_${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function openDetailModal(productId) {
  currentDetailProductId = productId;
  const product = products.find(p => p.id === productId);
  if (!product) {
    return;
  }

  detailModalTitle.textContent = `Chi tiết sản phẩm #${product.id}`;
  const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "";
  detailImage.src = imageUrl;
  detailImage.alt = product.title || "";

  detailExtraImages.innerHTML = "";
  if (Array.isArray(product.images) && product.images.length > 1) {
    product.images.slice(1).forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = product.title || "";
      img.className = "img-thumbnail";
      img.style.maxWidth = "60px";
      img.style.maxHeight = "60px";
      detailExtraImages.appendChild(img);
    });
  }

  detailTitleInput.value = product.title || "";
  detailPriceInput.value = product.price != null ? product.price : "";
  detailCategoryIdInput.value = product.category && product.category.id != null ? product.category.id : "";
  detailDescriptionInput.value = product.description || "";
  detailImagesInput.value = Array.isArray(product.images) ? product.images.join(", ") : "";
  detailModalStatus.textContent = "";

  detailModal.show();
}

function parseImagesFromInput(value) {
  return value
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function updateProduct() {
  if (currentDetailProductId == null) {
    return;
  }

  const title = detailTitleInput.value.trim();
  const price = Number(detailPriceInput.value);
  const categoryId = Number(detailCategoryIdInput.value);
  const description = detailDescriptionInput.value.trim();
  const images = parseImagesFromInput(detailImagesInput.value);

  if (!title || Number.isNaN(price) || Number.isNaN(categoryId) || images.length === 0) {
    detailModalStatus.textContent = "Vui lòng nhập đầy đủ dữ liệu hợp lệ.";
    detailModalStatus.className = "me-auto text-danger";
    return;
  }

  detailModalStatus.textContent = "Đang cập nhật...";
  detailModalStatus.className = "me-auto text-muted";

  const body = {
    title,
    price,
    description,
    categoryId,
    images
  };

  fetch(`${API_URL}/${currentDetailProductId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
    .then(response => response.json())
    .then(updated => {
      const index = products.findIndex(p => p.id === currentDetailProductId);
      if (index !== -1) {
        products[index] = updated;
      }
      filteredProducts = products.slice();
      renderTable();
      detailModalStatus.textContent = "Cập nhật thành công.";
      detailModalStatus.className = "me-auto text-success";
    })
    .catch(error => {
      console.error("Error updating product", error);
      detailModalStatus.textContent = "Cập nhật thất bại.";
      detailModalStatus.className = "me-auto text-danger";
    });
}

function createProduct() {
  const title = createTitleInput.value.trim();
  const price = Number(createPriceInput.value);
  const categoryId = Number(createCategoryIdInput.value);
  const description = createDescriptionInput.value.trim();
  const images = parseImagesFromInput(createImagesInput.value);

  if (!title || Number.isNaN(price) || Number.isNaN(categoryId) || images.length === 0) {
    createModalStatus.textContent = "Vui lòng nhập đầy đủ dữ liệu hợp lệ.";
    createModalStatus.className = "me-auto text-danger";
    return;
  }

  createModalStatus.textContent = "Đang tạo...";
  createModalStatus.className = "me-auto text-muted";

  const body = {
    title,
    price,
    description,
    categoryId,
    images
  };

  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
    .then(response => response.json())
    .then(created => {
      products.push(created);
      filteredProducts = products.slice();
      currentPage = 1;
      renderTable();
      createModalStatus.textContent = "Tạo sản phẩm thành công.";
      createModalStatus.className = "me-auto text-success";
      createTitleInput.value = "";
      createPriceInput.value = "";
      createCategoryIdInput.value = "";
      createDescriptionInput.value = "";
      createImagesInput.value = "";
    })
    .catch(error => {
      console.error("Error creating product", error);
      createModalStatus.textContent = "Tạo sản phẩm thất bại.";
      createModalStatus.className = "me-auto text-danger";
    });
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

pageSizeSelect.addEventListener("change", () => {
  pageSize = Number(pageSizeSelect.value);
  currentPage = 1;
  renderTable();
});

sortTitleBtn.addEventListener("click", () => {
  toggleSort("title");
});

sortPriceBtn.addEventListener("click", () => {
  toggleSort("price");
});

exportCsvBtn.addEventListener("click", () => {
  exportCurrentViewToCsv();
});

saveDetailBtn.addEventListener("click", () => {
  updateProduct();
});

createSubmitBtn.addEventListener("click", () => {
  createProduct();
});

createModalElement.addEventListener("hidden.bs.modal", () => {
  createModalStatus.textContent = "";
  createModalStatus.className = "me-auto text-muted";
});

detailModalElement.addEventListener("hidden.bs.modal", () => {
  detailModalStatus.textContent = "";
  detailModalStatus.className = "me-auto text-muted";
});

fetchProducts();

