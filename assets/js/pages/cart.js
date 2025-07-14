import ApiService from "../services/api.js";
import { getCurrentUser } from "../utils/auth.js";

function renderCart() {
  const cartProducts = JSON.parse(localStorage.getItem("cart_products")) || [];
  const tbody = document.querySelector(".table-cart-body");

  if (!tbody) return;

  if (cartProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">El carrito está vacío.</td></tr>';
    renderCartTotal(0);
    return;
  }

  tbody.innerHTML = cartProducts
    .map(
      (product) => `
    <tr>
      <td>
        <img src="${product.img}" alt="${product.title}" />
      </td>
      <td>${product.title}</td>
      <td class="display-off">$${product.price.toFixed(2)}</td>
      <td>
        <div class="container-quantity">
          <button class="btn-quantity btn-minus" data-id="${product.id}">
            <i class="fa-solid fa-minus"></i>
          </button>
          <span>${product.cant}</span>
          <button class="btn-quantity btn-plus" data-id="${product.id}">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </td>
      <td>$${product.price_total.toFixed(2)}</td>
      <td>
        <button class="btn-remove" data-id="${product.id}">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </td>
    </tr>
  `
    )
    .join("");

  // Asignar eventos a los botones
  tbody.querySelectorAll(".btn-plus").forEach((btn) => {
    btn.addEventListener("click", () => updateQuantity(btn.dataset.id, 1));
  });
  tbody.querySelectorAll(".btn-minus").forEach((btn) => {
    btn.addEventListener("click", () => updateQuantity(btn.dataset.id, -1));
  });
  tbody.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", () => removeProduct(btn.dataset.id));
  });

  // Calcular y mostrar el total
  const total = cartProducts.reduce((sum, p) => sum + p.price_total, 0);
  renderCartTotal(total);
}

function renderCartTotal(total) {
  let totalDiv = document.getElementById("cart-total");
  if (!totalDiv) {
    totalDiv = document.createElement("div");
    totalDiv.id = "cart-total";
    totalDiv.style.textAlign = "right";
    totalDiv.style.fontWeight = "bold";
    // Insertar después de la tabla
    const table = document.querySelector("table");
    if (table && table.parentNode) {
      table.parentNode.insertBefore(totalDiv, table.nextSibling);
    } else {
      document.body.appendChild(totalDiv);
    }
  }
  totalDiv.textContent = `Total: $${total.toFixed(2)}`;
}

function updateQuantity(productId, delta) {
  console.log(productId, delta);
  let cartProducts = JSON.parse(localStorage.getItem("cart_products")) || [];
  console.log(cartProducts);
  const idx = cartProducts.findIndex((p) => p.id.toString() === productId);
  console.log(idx);
  if (idx !== -1) {
    let newCant = cartProducts[idx].cant + delta;
    if (newCant < 1) newCant = 1;
    cartProducts[idx].cant = newCant;
    cartProducts[idx].price_total =
      cartProducts[idx].cant * cartProducts[idx].price;
    localStorage.setItem("cart_products", JSON.stringify(cartProducts));
    renderCart();
  }
}

function removeProduct(productId) {
  let cartProducts = JSON.parse(localStorage.getItem("cart_products")) || [];
  cartProducts = cartProducts.filter(
    (p) => p.id.toString() !== productId.toString()
  );
  localStorage.setItem("cart_products", JSON.stringify(cartProducts));
  renderCart();
}

function showCartModal(message, isLoading = false, isError = false) {
  const modal = document.getElementById("cart-message-modal");
  const text = document.getElementById("cart-message-text");
  if (!modal || !text) return;
  modal.style.display = "flex";
  if (isLoading) {
    text.innerHTML = `<div><span class="loader"></span><p>${message}</p> </div>`;
    text.style.color = "#333";
  } else {
    text.innerHTML = message;
    text.style.color = isError ? "red" : "green";
  }
}
function hideCartModal(delay = 1500) {
  setTimeout(() => {
    const modal = document.getElementById("cart-message-modal");
    if (modal) modal.style.display = "none";
  }, delay);
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const checkoutBtn = document.querySelector(".btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
      const cartProducts =
        JSON.parse(localStorage.getItem("cart_products")) || [];
      if (cartProducts.length === 0) {
        showCartModal("El carrito está vacío.", false, true);
        hideCartModal();
        return;
      }
      try {
        showCartModal("Procesando compra...", true);
        const cart = [];
        for (const producto of cartProducts) {
          const airtableProduct = await ApiService.getProductByDummyId(
            producto.id
          );
          if (
            !airtableProduct.records ||
            airtableProduct.records.length === 0
          ) {
            showCartModal(
              `No se encontró el producto en la base de datos interna (dummy_id: ${producto.id})`,
              false,
              true
            );
            hideCartModal();
            continue;
          }
          const product_id = airtableProduct.records[0].id;
          const data = {
            records: [
              {
                fields: {
                  product: [product_id],
                  cant: producto.cant,
                  value_total: producto.price_total,
                },
              },
            ],
          };
          const result = await ApiService.postTable("detalle_compras", data);
          cart.push(result.records[0].id);
        }
        const user = getCurrentUser();
        if (!user || !user.id) {
          showCartModal("No se pudo obtener el usuario actual.", false, true);
          hideCartModal();
          return;
        }
        const value_total = cartProducts.reduce(
          (sum, p) => sum + p.price_total,
          0
        );
        const today = new Date();
        const fecha_creada = today.toISOString().split("T")[0];
        const cartData = {
          records: [
            {
              fields: {
                value_total: value_total,
                user: [user.id],
                fecha_creada: fecha_creada,
                detalle_compras: cart,
              },
            },
          ],
        };
        await ApiService.postTable("cart", cartData);
        showCartModal("¡Compra realizada con éxito!");
        localStorage.removeItem("cart_products");
        renderCart();
        hideCartModal();
      } catch (error) {
        showCartModal("Ocurrió un error al procesar la compra.", false, true);
        hideCartModal();
      }
    });
  }
});
