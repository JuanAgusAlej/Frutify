import ApiService from "../services/api.js";

// Función para verificar si el usuario ya está logueado
function checkUserSession() {
  const user = localStorage.getItem("user");
  if (user) {
    // Si hay datos de usuario en localStorage, redirigir a la página de perfil
    window.location.href = "/Pages/User/";
    return true;
  }
  return false;
}

function setupRegisterModal() {
  const openBtn = document.getElementById("open-register-modal");
  const closeBtn = document.getElementById("close-register-modal");
  const modal = document.getElementById("register-modal");

  if (openBtn && closeBtn && modal) {
    openBtn.onclick = function (e) {
      e.preventDefault();
      modal.style.display = "flex";
    };
    closeBtn.onclick = function () {
      modal.style.display = "none";
    };
    modal.onclick = function (e) {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };
  }
}

function setupLoginForm() {
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    // Crear contenedor para mensajes de error/éxito
    let messageDiv = document.getElementById("login-message");
    if (!messageDiv) {
      messageDiv = document.createElement("div");
      messageDiv.id = "login-message";
      messageDiv.style.textAlign = "center";
      messageDiv.style.marginTop = "10px";
      loginForm.appendChild(messageDiv);
    }

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      messageDiv.textContent = "";

      const email = loginForm.querySelector('input[name="email"]').value;
      const password = loginForm.querySelector('input[name="password"]').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      // Mostrar loader
      messageDiv.innerHTML =
        '<span class="loader" style="display:inline-block;width:20px;height:20px;border:3px solid #ccc;border-top:3px solid #333;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;"></span> Verificando credenciales...';
      messageDiv.style.color = "#333";
      submitBtn.disabled = true;

      try {
        // Buscar usuario por email en la base de datos
        const userResponse = await ApiService.getUserByEmail(email);

        if (userResponse.records && userResponse.records.length > 0) {
          const user = userResponse.records[0];
          const userPassword = user.fields.password;

          // Verificar si la contraseña coincide
          if (userPassword === password) {
            messageDiv.textContent = "¡Inicio de sesión exitoso!";
            messageDiv.style.color = "green";

            // Guardar información del usuario en localStorage
            localStorage.setItem(
              "user",
              JSON.stringify({
                id: user.id,
                name: user.fields.name,
                email: user.fields.email,
                phone: user.fields.phone,
                direccion: user.fields.direccion,
              })
            );

            // Redirigir a la página de perfil después de un breve delay
            setTimeout(() => {
              window.location.href = "/Pages/User/";
            }, 1000);
          } else {
            messageDiv.textContent = "Contraseña incorrecta";
            messageDiv.style.color = "red";
          }
        } else {
          messageDiv.textContent = "Usuario no encontrado";
          messageDiv.style.color = "red";
        }
      } catch (error) {
        console.error("Error en el login:", error);
        messageDiv.textContent = "Error al conectar con el servidor";
        messageDiv.style.color = "red";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
}

function setupRegisterForm() {
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    // Creo o selecciono un contenedor para mensajes
    let messageDiv = document.getElementById("register-message");
    if (!messageDiv) {
      messageDiv = document.createElement("div");
      messageDiv.id = "register-message";
      messageDiv.style.textAlign = "center";
      registerForm.appendChild(messageDiv);
    }

    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      messageDiv.textContent = "";
      const email = registerForm.querySelector(
        'input[name="register-email"]'
      ).value;
      const phone = registerForm.querySelector(
        'input[name="register-phone"]'
      ).value;
      const direccion = registerForm.querySelector(
        'input[name="register-direccion"]'
      ).value;
      const password = registerForm.querySelector(
        'input[name="register-password"]'
      ).value;
      const repeatPassword = registerForm.querySelector(
        'input[name="register-repeat-password"]'
      ).value;
      const name = registerForm.querySelector(
        'input[name="register-name"]'
      ).value;
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (password !== repeatPassword) {
        messageDiv.textContent = "Las contraseñas no coinciden";
        messageDiv.style.color = "red";
        return;
      }

      // Mostrar loader y ocultar botón
      messageDiv.innerHTML =
        '<span class="loader" style="display:inline-block;width:20px;height:20px;border:3px solid #ccc;border-top:3px solid #333;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;"></span> Procesando...';
      messageDiv.style.color = "#333";
      submitBtn.style.display = "none";

      // Estructura para Airtable
      const data = {
        records: [
          {
            fields: { email, phone, direccion, password, name },
          },
        ],
      };

      try {
        const response = await ApiService.postTable("user", data);
        messageDiv.textContent = "¡Registro exitoso!";
        messageDiv.style.color = "green";

        // Crear botón "Cerrar" que cierre el modal
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Cerrar";
        closeBtn.type = "button";
        closeBtn.className = "btn-login";
        closeBtn.style.marginTop = "10px";
        closeBtn.onclick = function () {
          const modal = document.getElementById("register-modal");
          if (modal) {
            modal.style.display = "none";
            // Resetear el formulario y mostrar el botón original
            registerForm.reset();
            submitBtn.style.display = "block";
            messageDiv.textContent = "";
          }
        };
        messageDiv.appendChild(closeBtn);
      } catch (error) {
        messageDiv.textContent = "Hubo un problema, intente más tarde";
        messageDiv.style.color = "red";
        submitBtn.style.display = "block";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Verificar sesión del usuario primero
  if (checkUserSession()) {
    return; // Si ya está logueado, no continuar con el setup
  }

  setupRegisterModal();
  setupLoginForm();
  setupRegisterForm();
});
