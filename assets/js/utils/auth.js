export function isUserLoggedIn() {
  const user = localStorage.getItem("user");
  return user !== null;
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function logoutUser() {
  localStorage.removeItem("user");
  window.location.reload();
}

export function updateNavbarAuth() {
  const loginLink = document.querySelector("#auth-navbar");
  console.log(loginLink);
  if (!loginLink) return;

  const isLoggedIn = isUserLoggedIn();
  const user = getCurrentUser();

  const pTag = loginLink.querySelector("p");
  if (!pTag) return;

  if (isLoggedIn && user) {
    loginLink.href = "/Pages/User/";
    pTag.textContent = "Perfil";
  } else {
    loginLink.href = "/Pages/Login/";
    pTag.textContent = "Login";
  }
}

function getImagePath() {
  const currentPath = window.location.pathname;

  if (
    currentPath === "/" ||
    currentPath === "/index.html" ||
    currentPath.endsWith("/")
  ) {
    return ".";
  } else {
    return "../..";
  }
}

export function initAuth() {
  updateNavbarAuth();
}

export function setCurrentUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}
