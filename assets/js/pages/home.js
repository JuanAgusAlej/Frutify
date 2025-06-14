import { createProductCard } from "../utils/helpers.js";
import ApiService from "../services/api.js";

// Traer los prouctos
async function loadFeaturedProducts(skip = 0) {
  try {
    const data = await ApiService.get(`/products?limit=12&skip=${skip}`);
    const products = data.products;

    const container = document.getElementById("conteiner-cards-products-home");
    container.innerHTML = "";

    console.log(products.length);

    products.forEach((product) => {
      const cardHTML = createProductCard({
        image: product.thumbnail,
        type: product.category,
        title: product.title,
        price: product.price,
        originalPrice: product.price * 1.2,
        link: `./Pages/Product-details?id=${product.id}`,
      });
      container.innerHTML += cardHTML;
    });
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    const container = document.getElementById("conteiner-cards-products-home");
    container.innerHTML =
      '<p class="error-message">No se pudieron cargar los productos. Por favor, intente más tarde.</p>';
  }
}

// Cambiar categoria
function setupFilterButtons() {
  const buttons = document.querySelectorAll(".filter-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!button.classList.contains("active")) {
        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        const buttonText = button.textContent.trim();
        switch (buttonText) {
          case "Populares":
            loadFeaturedProducts(0);
            break;
          case "Nuevos":
            loadFeaturedProducts(12);
            break;
          case "Ofertas":
            loadFeaturedProducts(24);
            break;
        }
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadFeaturedProducts(0);
  setupFilterButtons();
});
