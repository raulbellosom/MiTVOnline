const app = {
  currentSearchResults: [],
  isSearching: false,

  async init() {
    console.log("Iniciando TVMaze Explorer...");

    ui.init();
    favorites.init();

    this.setupEvents();

    await this.loadFeaturedShows();

    console.log("Aplicación iniciada correctamente!");
  },

  setupEvents() {
    if (ui.elements.searchForm) {
      ui.elements.searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSearch();
      });
    }

    if (ui.elements.searchInput) {
      const debouncedSearch = ui.debounce(() => {
        const query = ui.elements.searchInput.value.trim();
        if (query.length >= 3) {
          this.handleSearch();
        } else if (query.length === 0) {
          this.clearSearch();
        }
      }, 500);

      ui.elements.searchInput.addEventListener("input", debouncedSearch);
    }

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        if (ui.elements.searchInput) {
          ui.elements.searchInput.focus();
        }
      }

      // Limpiar búsqueda con Escape
      if (e.key === "Escape") {
        this.clearSearch();
      }
    });
  },

  async handleSearch() {
    if (this.isSearching) return;

    const query = ui.elements.searchInput?.value.trim();

    if (!query) {
      this.clearSearch();
      return;
    }

    if (query.length < 2) {
      ui.showError("El término de búsqueda debe tener al menos 2 caracteres.");
      return;
    }

    this.isSearching = true;
    ui.showLoading();
    ui.toggleFeaturedSection(false);

    try {
      console.log(`Buscando: "${query}"`);

      const shows = await api.searchShows(query);
      this.currentSearchResults = shows;

      if (shows && shows.length > 0) {
        console.log(`Encontradas ${shows.length} series`);
        ui.renderShows(shows, ui.elements.searchResults);
        this.addFavoriteButtons();
      } else {
        console.log("No se encontraron resultados");
        ui.showNoResults();
      }
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      ui.showError(
        error.message ||
          "Error al realizar la búsqueda. Por favor, intenta de nuevo."
      );
      this.currentSearchResults = [];
    } finally {
      this.isSearching = false;
    }
  },
  clearSearch() {
    if (ui.elements.searchInput) {
      ui.elements.searchInput.value = "";
    }

    ui.clearSearchResults();
    ui.toggleFeaturedSection(true);
    this.currentSearchResults = [];
  },

  async loadFeaturedShows() {
    if (!ui.elements.featuredShows) return;

    try {
      console.log("Cargando series populares...");
      const shows = await api.getPopularShows();

      if (shows && shows.length > 0) {
        console.log(`Cargadas ${shows.length} series populares`);
        ui.renderShows(shows, ui.elements.featuredShows);
        this.addFavoriteButtons();
      } else {
        ui.elements.featuredShows.innerHTML =
          "<p>No se pudieron cargar las series destacadas.</p>";
      }
    } catch (error) {
      console.error("Error cargando series populares:", error);
      ui.elements.featuredShows.innerHTML =
        "<p>Error al cargar las series destacadas.</p>";
    }
  },

  addFavoriteButtons() {
    const showCards = document.querySelectorAll("[data-show-id]");

    showCards.forEach((card) => {
      const showId = parseInt(card.dataset.showId);
      if (!showId) return;

      if (card.querySelector(".favorite-btn")) return;

      const cardContent = card.querySelector(".card__content");
      if (!cardContent) return;

      let showData = null;
      if (this.currentSearchResults.length > 0) {
        showData = this.currentSearchResults.find((show) => show.id === showId);
      }

      const favoriteBtn = favorites.createFavoriteButton(showId, showData);
      cardContent.appendChild(favoriteBtn);
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  app.init();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.log("Página visible");
  } else {
    console.log("Página oculta");
  }
});

window.addEventListener("online", () => {
  console.log("Conexión restaurada");
});

window.addEventListener("offline", () => {
  console.log("Sin conexión");
});
