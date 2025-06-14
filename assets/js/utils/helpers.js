/**
 * Crea la tarjeta de producto
 * @param {Object} product - Objeto con la información del producto
 * @param {string} product.image - URL de la imagen del producto
 * @param {string} product.type - Tipo de producto (ej: Fruta, Verdura)
 * @param {string} product.title - Título del producto
 * @param {number} product.price - Precio actual del producto
 * @param {number} product.originalPrice - Precio original (para ofertas)
 * @param {string} product.link - URL de la página de detalles
 * @returns {string} - HTML de la tarjeta de producto
 */
export const createProductCard = (product) => {
  const { image, type, title, price, originalPrice, link } = product;

  // Formatear precios a dos decimales
  const formattedPrice = price.toFixed(2);
  const formattedOriginalPrice = originalPrice
    ? originalPrice.toFixed(2)
    : null;

  return `
        <a class="card-product" href="${link}">
        <div class="container-img-card">
            <img
                class="img-card"
                src="${image}"
                alt="${title}"
            />
            </div>
            <p class="type-card">${type}</p>
            <h4 class="title-card">${title}</h4>
            <div class="card-price">
                <div class="container-price">
                    <spam class="price-total">$${formattedPrice}</spam>
                    ${
                      formattedOriginalPrice
                        ? `<p class="price-deals">$${formattedOriginalPrice}</p>`
                        : ""
                    }
                </div>
                <button class="card-button">
                    <i class="fa-solid fa-cart-plus"></i>
                    <spam>Add</spam>
                </button>
            </div>
        </a>
    `;
};
