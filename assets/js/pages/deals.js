import { createDealCard } from "../utils/helpers.js";
import ApiService from "../services/api.js";

// Cargar productos
async function loadDealsProducts() {
  try {
    const data = await ApiService.get("/products?limit=9");
    const products = data.products;

    const container = document.querySelector(".deals-cards");
    if (!container) {
      console.error("Deals container not found!");
      return;
    }

    container.innerHTML = "";

    products.forEach((product) => {
      const cardHTML = createDealCard({
        image: product.thumbnail,
        type: product.category,
        title: product.title,
        price: product.price,
        link: `../Product-details/?id=${product.id}`,
        discountPercentage: product.discountPercentage,
      });
      container.innerHTML += cardHTML;
    });
  } catch (error) {
    console.error("Error al cargar los productos en oferta:", error);
    const container = document.querySelector(".deals-cards");
    container.innerHTML =
      '<p class="error-message">No se pudieron cargar los productos. Por favor, intente más tarde.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadDealsProducts();
});
