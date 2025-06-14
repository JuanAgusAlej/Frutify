// busqueda
function setupSearch() {
  const searchForm = document.getElementById("searchForm");

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchInput = searchForm.querySelector('input[name="search"]');
    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
      const searchUrl = new URL("/Pages/Shop", window.location.origin);
      searchUrl.searchParams.set("search", searchTerm);

      window.location.href = searchUrl.href;
    }
  });
}

document.addEventListener("DOMContentLoaded", setupSearch);
