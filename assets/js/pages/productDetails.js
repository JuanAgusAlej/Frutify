import ApiService from "../services/api.js";
import { createProductCard } from "../utils/helpers.js";
import { getCurrentUser } from "../utils/auth.js";

// producto relacionado
async function getRelatedProducts(currentProductId, categoryProduct) {
  try {
    const response = await ApiService.get(
      categoryProduct ? `/products/category/${categoryProduct}` : "/products"
    );
    const products = response.products;

    const relatedProducts = products
      .filter((product) => product.id !== currentProductId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map((product) => {
        return {
          id: product.id,
          title: product.title,
          type: product.category,
          price: product.price,
          discountPercentage: product.discountPercentage,
          image: product.images[0],
          link: `./?id=${product.id}`,
        };
      });

    return relatedProducts;
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

// Render producto relacionados
async function renderRelatedProducts(currentProductId, categoryProduct) {
  const container = document.querySelector(".conteiner-cards-products");

  if (container) {
    try {
      const relatedProducts = await getRelatedProducts(
        currentProductId,
        categoryProduct
      );

      if (relatedProducts.length === 0) {
        container.innerHTML =
          '<div class="no-products">No related products found</div>';
        return;
      }
      console.log(relatedProducts);
      container.innerHTML = relatedProducts
        .map((product) => createProductCard(product))
        .join("");

      document.querySelectorAll(".card-button").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          const productId = button.dataset.productId;
          addToCart(productId);
        });
      });
    } catch (error) {
      container.innerHTML =
        '<div class="error">Error loading related products</div>';
      console.error("Error rendering related products:", error);
    }
  }
}

// agregar o restar cantidad
function quantityFuncion() {
  const minusButton = document.querySelector("#minus-product");
  const plusButton = document.querySelector("#plus-product");
  const quantityValue = document.querySelector(".quantity-value");

  minusButton.addEventListener("click", () => {
    let currentQuantity = parseInt(quantityValue.textContent);
    if (currentQuantity > 1) {
      quantityValue.textContent = currentQuantity - 1;
    }
  });

  plusButton.addEventListener("click", () => {
    let currentQuantity = parseInt(quantityValue.textContent);
    quantityValue.textContent = currentQuantity + 1;
  });
}

async function renderProductDetaild() {
  const productSection = document.querySelector(".product-details");

  try {
    const productDetail = await getProductById();

    productSection.innerHTML = `
      <div class="conteiner-product-detail-image">
        <img id="product-detail-image" class="product-image" />
      </div>
      <div class="product-info">
        <h2 id="product-detail-title" class="product-title"></h2>
        <div class="product-details-container">
          <h5 class="text-gray">Description</h5>
          <p id="product-detail-description"></p>
        </div>
        <div class="product-details-container">
          <h5 class="text-gray">Rating</h5>
          <p id="product-detail-rating"></p>
        </div>
        <div class="product-details-container">
          <h5 class="text-red">Price</h5>
            <h4 id="product-detail-price" class="product-price"></h4>
        </div>
        <div class="product-details-container">
          <h5 class="text-gray">Quantity</h5>
          <div class="product-quantity">
            <button id="minus-product">-</button>
              <h4 class="quantity-value">1</h4>
            <button id="plus-product">+</button>
          </div>
        </div>
        <button class="add-product">
          <i class="fa-solid fa-cart-shopping"></i>
          <spam>Add to Cart</spam>
        </button>
      </div>
    `;

    const title = document.querySelector("#product-detail-title");
    const description = document.querySelector("#product-detail-description");
    const images = document.querySelector("#product-detail-image");
    const rating = document.querySelector("#product-detail-rating");
    const price = document.querySelector("#product-detail-price");

    title.textContent = productDetail.title;
    description.textContent = productDetail.description;
    rating.textContent = productDetail.rating;
    price.textContent = `$${productDetail.price}`;
    images.src = productDetail.images[0];
    images.alt = productDetail.title;

    // evento de agregar al carro
    const addToCartButton = document.querySelector(".add-product");
    addToCartButton.addEventListener("click", () => {
      addToCart(productDetail.id);
    });

    quantityFuncion();

    renderRelatedProducts(productDetail.id, productDetail.category);
  } catch (error) {
    productSection.innerHTML =
      '<div class="error-state">Error loading product. Please try again later.</div>';
    console.error("Error rendering product details:", error);
  }
}

// Agregar producto al carrito
async function addToCart(productId) {
  try {
    const quantityValue = document.querySelector(".quantity-value");
    const product = await ApiService.get(`/products/${productId}`);
    const user = getCurrentUser();
    if (!user) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      return;
    }
    // Buscar el record ID del producto en Airtable
    const airtableProduct = await ApiService.getProductByDummyId(productId);
    let airtableProductId;
    if (!airtableProduct.records || airtableProduct.records.length === 0) {
      // Si no existe, lo agrego a Airtable SIN cant y cart
      const newProductData = {
        records: [
          {
            fields: {
              name: product.title,
              img: product.images[0],
              price: product.price,
              dummy_id: product.id,
            },
          },
        ],
      };
      const newProductResponse = await ApiService.postTable(
        "product",
        newProductData
      );
      if (
        !newProductResponse.records ||
        newProductResponse.records.length === 0
      ) {
        alert("No se pudo agregar el producto a la base de datos interna.");
        return;
      }
      airtableProductId = newProductResponse.records[0].id;
    } else {
      airtableProductId = airtableProduct.records[0].id;
    }
    // Construir el objeto para la tabla cart
    const valueTotal = product.price * parseInt(quantityValue.textContent);
    const cartData = {
      records: [
        {
          fields: {
            products: [airtableProductId],
            value_total: valueTotal,
          },
        },
      ],
    };
    // Aquí iría tu llamada para guardar el cart (no incluida en el fragmento original)

    // --- Manejo de localStorage para múltiples productos ---
    let cartProducts = JSON.parse(localStorage.getItem("cart_products")) || [];
    const quantityToAdd = parseInt(quantityValue.textContent);
    const price = product.price;
    const existingProductIndex = cartProducts.findIndex(
      (p) => p.id === product.id
    );
    if (existingProductIndex !== -1) {
      // Si ya existe, actualizar cantidad y price_total
      cartProducts[existingProductIndex].cant += quantityToAdd;
      cartProducts[existingProductIndex].price_total =
        cartProducts[existingProductIndex].cant * price;
    } else {
      // Si no existe, agregarlo
      cartProducts.push({
        id: product.id,
        title: product.title,
        img: product.images[0],
        price: price,
        cant: quantityToAdd,
        price_total: price * quantityToAdd,
      });
    }
    localStorage.setItem("cart_products", JSON.stringify(cartProducts));
    alert("Producto agregado al carrito correctamente.");
  } catch (error) {
    console.error("Error adding product to cart:", error);
    alert("Error al agregar el producto al carrito.");
  }
}

// buscar producto por id
async function getProductById() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
      throw new Error("No product ID provided in URL");
    }

    const product = await ApiService.get(`/products/${productId}`);
    console.log(product);
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  renderProductDetaild();
});
