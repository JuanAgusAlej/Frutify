/**
 * Crea la tarjeta de producto
 * @param {Object} product - Objeto con la información del producto
 * @param {string} product.image - URL de la imagen del producto
 * @param {string} product.type - Tipo de producto (ej: Fruta, Verdura)
 * @param {string} product.title - Título del producto
 * @param {number} product.price - Precio actual del producto
 * @param {string} product.link - URL de la página de detalles
 * @param {number} product.discountPercentage - descuento del producto
 * @returns {string} - HTML de la tarjeta de producto
 */
export const createProductCard = (product) => {
  const { image, type, title, price, link, discountPercentage } = product;

  const originalPrice = price / (1 - discountPercentage / 100);

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
                ${
                  originalPrice
                    ? `<spam class="price-total">$${originalPrice.toFixed(
                        2
                      )}</spam>`
                    : ""
                }    
                
                    ${
                      price
                        ? `<p class="price-deals">$${price.toFixed(2)}</p>`
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

/**
 * Crea la tarjeta de oferta
 * @param {Object} product - Objeto con la información del producto
 * @param {string} product.image - URL de la imagen del producto
 * @param {string} product.type - Tipo de producto (ej: Fruta, Verdura)
 * @param {string} product.title - Título del producto
 * @param {number} product.price - Precio actual del producto
 * @param {number} product.discountPercentage - descuento del producto
 * @param {string} product.link - URL de la página de detalles
 * @returns {string} - HTML de la tarjeta de oferta
 */
export const createDealCard = (product) => {
  const { image, type, title, price, link, discountPercentage } = product;

  const originalPrice = price / (1 - discountPercentage / 100);

  return `

    <a class="deal-card" href="${link}">
      <img
        src="${image}"
        alt="${title}"
      />
      <div class="deal-card-info">
        <p class="deal-percentage">${discountPercentage}% discount</p>
        <div class="deal-card-text">
          <span>${type}</span>
          <h4>${title}</h4>
        </div>
        <div>
          <div class="deal-price">
            <h3>$${price.toFixed(2)}</h3>
            <h5>$${originalPrice.toFixed(2)}</h5>
          </div>
          <button>
            <i class="fa-solid fa-cart-shopping"></i>
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </a>
  `;
};
