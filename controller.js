import { fetchProductsApi, updateProductApi, createProductApi } from "./api.js";
import {
  initProducts,
  getCurrentPage,
  setPageSize,
  setCurrentPage,
  toggleSortField,
  getPagedData,
  updateProductInState,
  addProductToState,
  parseImagesFromInput
} from "./model.js";

let currentDetailProductId = null;

const searchInput = document.getElementById("searchInput");
const pageSizeSelect = document.getElementById("pageSizeSelect");
const productsTbody = document.getElementById("productsTbody");
const pagination = document.getElementById("pagination");
const paginationInfo = document.getElementById("paginationInfo");
const sortTitleBtn = document.getElementById("sortTitleBtn");
const sortPriceBtn = document.getElementById("sortPriceBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");

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
  const query = searchInput.value;
  const { items, totalItems, totalPages, startIndex, endIndex, currentPage } = getPagedData(query);

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
  categoryTd.innerHTML = categoryName ? `<span class="badge text-bg-secondary">${categoryName}</span>` : "";

    const imageTd = document.createElement("td");
    const img = document.createElement("img");
    const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "";
    img.src = imageUrl;
    img.alt = product.title || "";
    img.className = "img-thumbnail product-thumb";
    imageTd.appendChild(img);

    tr.appendChild(idTd);
    tr.appendChild(titleTd);
    tr.appendChild(priceTd);
    tr.appendChild(categoryTd);
    tr.appendChild(imageTd);

    tr.addEventListener("click", () => {
      openDetailModal(product);
    });

    productsTbody.appendChild(tr);
  });

  initTooltips();

  const showingFrom = totalItems === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(endIndex, totalItems);
  paginationInfo.textContent = `Hiển thị ${showingFrom}-${showingTo} trên tổng ${totalItems}`;

  renderPagination(totalPages, currentPage);
}

function renderPagination(totalPages, currentPage) {
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
      setCurrentPage(currentPage - 1);
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
      if (page !== currentPage) {
        setCurrentPage(page);
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
      setCurrentPage(currentPage + 1);
      renderTable();
    }
  });
  nextLi.appendChild(nextLink);
  pagination.appendChild(nextLi);
}

function exportCurrentViewToCsv() {
  const query = searchInput.value;
  const { items } = getPagedData(query);
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
  link.download = `products_page_${getCurrentPage()}_${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function openDetailModal(product) {
  currentDetailProductId = product.id;

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
      img.className = "img-thumbnail product-thumb-small";
      detailExtraImages.appendChild(img);
    });
  }

  detailTitleInput.value = product.title || "";
  detailPriceInput.value = product.price != null ? product.price : "";
  detailCategoryIdInput.value = product.category && product.category.id != null ? product.category.id : "";
  detailDescriptionInput.value = product.description || "";
  detailImagesInput.value = Array.isArray(product.images) ? product.images.join(", ") : "";
  detailModalStatus.textContent = "";
  detailModalStatus.className = "me-auto text-muted";

  detailModal.show();
}

function handleUpdateProduct() {
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

  updateProductApi(currentDetailProductId, body)
    .then(updated => {
      updateProductInState(updated);
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

function handleCreateProduct() {
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

  createProductApi(body)
    .then(created => {
      addProductToState(created);
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
  setCurrentPage(1);
  renderTable();
});

pageSizeSelect.addEventListener("change", () => {
  setPageSize(Number(pageSizeSelect.value));
  renderTable();
});

sortTitleBtn.addEventListener("click", () => {
  toggleSortField("title");
  renderTable();
});

sortPriceBtn.addEventListener("click", () => {
  toggleSortField("price");
  renderTable();
});

exportCsvBtn.addEventListener("click", () => {
  exportCurrentViewToCsv();
});

saveDetailBtn.addEventListener("click", () => {
  handleUpdateProduct();
});

createSubmitBtn.addEventListener("click", () => {
  handleCreateProduct();
});

createModalElement.addEventListener("hidden.bs.modal", () => {
  createModalStatus.textContent = "";
  createModalStatus.className = "me-auto text-muted";
});

detailModalElement.addEventListener("hidden.bs.modal", () => {
  detailModalStatus.textContent = "";
  detailModalStatus.className = "me-auto text-muted";
});

fetchProductsApi()
  .then(data => {
    initProducts(data);
    renderTable();
  })
  .catch(error => {
    console.error("Error fetching products", error);
  });

