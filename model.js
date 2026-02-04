let products = [];
let sortField = null;
let sortDirection = "asc";
let pageSize = 10;
let currentPage = 1;

function initProducts(list) {
  products = Array.isArray(list) ? list : [];
  currentPage = 1;
}

function getCurrentPage() {
  return currentPage;
}

function setPageSize(size) {
  pageSize = size;
  currentPage = 1;
}

function setCurrentPage(page) {
  currentPage = page;
}

function toggleSortField(field) {
  if (sortField === field) {
    sortDirection = sortDirection === "asc" ? "desc" : "asc";
  } else {
    sortField = field;
    sortDirection = "asc";
  }
}

function getPagedData(query) {
  const search = (query || "").trim().toLowerCase();
  let filtered = products;
  if (search) {
    filtered = products.filter(p => {
      const title = (p.title || "").toLowerCase();
      return title.includes(search);
    });
  }

  const sorted = filtered.slice();
  if (sortField) {
    const direction = sortDirection === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
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

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = sorted.slice(startIndex, endIndex);

  return {
    items,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    currentPage
  };
}

function updateProductInState(updated) {
  const index = products.findIndex(p => p.id === updated.id);
  if (index !== -1) {
    products[index] = updated;
  }
}

function addProductToState(created) {
  products.push(created);
  currentPage = 1;
}

function parseImagesFromInput(value) {
  return value
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export {
  initProducts,
  getCurrentPage,
  setPageSize,
  setCurrentPage,
  toggleSortField,
  getPagedData,
  updateProductInState,
  addProductToState,
  parseImagesFromInput
};

