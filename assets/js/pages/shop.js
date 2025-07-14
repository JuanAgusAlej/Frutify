import { createProductCard } from "../utils/helpers.js";
import ApiService from "../services/api.js";

// ocultar o mostrar categoria
function setupFilterToggle() {
  const chevronIcon = document.querySelector(".fa-chevron-down");
  const filterList = document.querySelector(".filter-list");

  if (chevronIcon && filterList) {
    chevronIcon.addEventListener("click", () => {
      filterList.style.display =
        filterList.style.display === "none" ? "block" : "none";

      if (filterList.style.display === "none") {
        chevronIcon.classList.remove("fa-chevron-down");
        chevronIcon.classList.add("fa-chevron-up");
      } else {
        chevronIcon.classList.remove("fa-chevron-up");
        chevronIcon.classList.add("fa-chevron-down");
      }
    });
  }
}

// cargar categorías
async function loadCategories() {
  try {
    const data = await ApiService.get("/products/categories");
    console.log("Categories:", data);

    const categoriesList = document.querySelector(".filter-list");
    if (!categoriesList) {
      console.error("Categories list not found!");
      return;
    }

    const categoriesHTML = data
      .map(
        (category) => `
      <li>
        ${category.name}
        <input type="radio" name="category" value="${category.slug}" />
      </li>
    `
      )
      .join("");

    categoriesList.innerHTML = categoriesHTML;

    const categoryInputs = categoriesList.querySelectorAll(
      'input[type="radio"]'
    );
    categoryInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const slug = input.value;
        const categoryUrl = new URL(window.location.href);
        categoryUrl.searchParams.set("category", slug);
        window.history.pushState({}, "", categoryUrl);
        loadProducts();
      });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get("category");
    if (selectedCategory) {
      const selectedInput = categoriesList.querySelector(
        `input[value="${selectedCategory}"]`
      );
      if (selectedInput) {
        selectedInput.checked = true;
      }
    }
  } catch (error) {
    console.error("Error al cargar las categorías:", error);
  }
}

// cargar productos
async function loadProducts() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get("search");
    const categorySlug = urlParams.get("category");

    console.log("URL Params:", window.location.search);
    console.log("Search Term:", searchTerm);
    console.log("Category:", categorySlug);

    const searchSpan = document.querySelector("#filter-container");
    if (searchSpan) {
      if (searchTerm) {
        searchSpan.innerHTML = `<div class="filter-select"><span > ${searchTerm} </span>
            <i class="fa-regular fa-circle-xmark delete-filter"></i>
            </div>
            `;
      } else if (categorySlug) {
        searchSpan.innerHTML = `<div class="filter-select"><span > ${categorySlug} </span>
            <i class="fa-regular fa-circle-xmark delete-filter"></i>
            </div>
            `;
      } else {
        searchSpan.innerHTML = `<span class="filter-select">No hay filtro aplicado
             </span>
            `;
      }

      const filterSelect = searchSpan.querySelector(".filter-select");
      if (filterSelect) {
        filterSelect.addEventListener("click", () => {
          window.history.pushState({}, "", "/Pages/Shop");
          loadProducts();
          loadCategories();
        });
      }
    }

    let endpoint = "/products?limit=24";
    if (searchTerm) {
      endpoint = `/products/search?q=${encodeURIComponent(searchTerm)}`;
    } else if (categorySlug) {
      endpoint = `/products/category/${categorySlug}`;
    }
    console.log("Using endpoint:", endpoint);

    console.log("Fetching data from:", endpoint);
    const data = await ApiService.get(endpoint);
    console.log("API Response:", data);

    const products = data.products;
    console.log("Products found:", products.length);

    const container = document.getElementById("container-products");
    if (!container) {
      console.error("Container not found!");
      return;
    }

    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML =
        '<p class="no-results">No se encontraron productos.</p>';
      return;
    }

    products.forEach((product) => {
      const originalPrice =
        product.price / (1 - product.discountPercentage / 100);
      const cardHTML = createProductCard({
        image: product.thumbnail,
        type: product.category,
        title: product.title,
        price: originalPrice,
        discountPercentage: product.discountPercentage,
        link: `../Product-details/?id=${product.id}`,
      });
      container.innerHTML += cardHTML;
    });
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    const container = document.getElementById("container-products");
    container.innerHTML =
      '<p class="error-message">No se pudieron cargar los productos. Por favor, intente más tarde.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCategories();
  setupFilterToggle();
});
