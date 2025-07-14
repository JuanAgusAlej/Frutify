import {
  getCurrentUser,
  isUserLoggedIn,
  setCurrentUser,
} from "../utils/auth.js";
import ApiService from "../services/api.js";

/**
 * Load and display user profile data
 */
function loadUserProfile() {
  if (!isUserLoggedIn()) {
    // If user is not logged in, redirect to login page
    window.location.href = "/Pages/Login/";
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    window.location.href = "/Pages/Login/";
    return;
  }

  // Update user profile data in the DOM
  updateProfileDisplay(user);
}

/**
 * Update the profile display with user data
 * @param {Object} user - User data object
 */
function updateProfileDisplay(user) {
  // Update name
  const nameElement = document.querySelector("#name");
  if (nameElement) {
    nameElement.textContent = user.name || "No disponible";
  }

  // Update phone
  const phoneElement = document.querySelector("#phone");
  if (phoneElement) {
    phoneElement.textContent = user.phone || "No disponible";
  }

  // Update email
  const emailElement = document.querySelector("#email");
  if (emailElement) {
    emailElement.textContent = user.email || "No disponible";
  }

  // Update address
  const addressElement = document.querySelector("#address");
  if (addressElement) {
    addressElement.textContent = user.direccion || "No disponible";
  }
}

// Modal logic for updating address
function setupAddressModal() {
  const openBtn = document.getElementById("open-address-modal");
  const modal = document.getElementById("address-modal");
  const cancelBtn = document.getElementById("cancel-address-modal");
  const form = document.getElementById("address-form");
  const addressInput = document.getElementById("new-address");
  const addressDisplay = document.getElementById("address");

  if (!openBtn || !modal || !cancelBtn || !form) return;

  openBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    addressInput.value =
      addressDisplay.textContent !== "No disponible"
        ? addressDisplay.textContent
        : "";
    addressInput.focus();
  });

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById("address-message");
    const saveBtn = document.getElementById("save-address-modal");
    const cancelBtn = document.getElementById("cancel-address-modal");
    messageDiv.textContent = "";
    const newAddress = addressInput.value.trim();
    if (newAddress) {
      messageDiv.innerHTML =
        '<div class="conteiner-loader"><span class="loader"></span></div>';
      saveBtn.style.display = "none";
      cancelBtn.style.display = "none";
      addressDisplay.textContent = newAddress;
      const user = getCurrentUser();
      if (user) {
        user.direccion = newAddress;
        setCurrentUser(user);
        try {
          await ApiService.patchTable("user", {
            records: [
              {
                id: user.id,
                fields: { direccion: newAddress },
              },
            ],
          });
          messageDiv.textContent = "¡Dirección actualizada con éxito!";
          messageDiv.style.color = "green";
          setTimeout(() => {
            modal.style.display = "none";
            messageDiv.textContent = "";
            saveBtn.style.display = "";
            cancelBtn.style.display = "";
          }, 1500);
        } catch (err) {
          messageDiv.textContent =
            "Error actualizando la dirección en la base de datos";
          messageDiv.style.color = "red";
          saveBtn.style.display = "";
          cancelBtn.style.display = "";
        }
      }
    }
  });
}

async function renderOrderHistory() {
  const user = getCurrentUser();
  if (!user || !user.id) return;
  const response = await ApiService.getTable("cart");
  console.log(response);
  const container = document.querySelector(".order-history-data-container");
  if (!container) return;

  if (!response.records || response.records.length === 0) {
    container.innerHTML = "<p>No tienes órdenes previas.</p>";
    return;
  }

  const orderUser = response.records.filter(
    (cart) =>
      Array.isArray(cart.fields.user) && cart.fields.user.includes(user.id)
  );

  if (!orderUser || orderUser.length === 0) {
    container.innerHTML = "<p>No tienes órdenes previas.</p>";
    return;
  }

  container.innerHTML = response.records
    .map(
      (cart) => `
    <div class="order-history-data">
      <div>
        <h3>Order ID</h3>
        <p>${cart.id}</p>
      </div>
      <div>
        <h3>$${Number(cart.fields.value_total).toFixed(2)}</h3>
        <p>${cart.fields.fecha_creada}</p>
      </div>
    </div>
  `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  setupAddressModal();
  renderOrderHistory();
});
