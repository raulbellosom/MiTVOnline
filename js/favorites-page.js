const favoritesPage = {
  currentFavorites: [],

  // Inicializar página de favoritos
  init() {
    console.log("Iniciando página de favoritos...");

    // Inicializar módulos
    favorites.init();

    // Cargar y mostrar favoritos
    this.loadAndRenderFavorites();

    // Configurar eventos
    this.setupEvents();
  },

  // Configurar eventos
  setupEvents() {
    // Botón de limpiar todos los favoritos
    const clearAllBtn = document.getElementById("clearAllFavorites");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => {
        this.handleClearAllFavorites();
      });
    }
  },

  // Cargar y renderizar favoritos
  loadAndRenderFavorites() {
    this.currentFavorites = favorites.getAllFavorites();
    console.log(`Cargados ${this.currentFavorites.length} favoritos`);

    if (this.currentFavorites.length === 0) {
      this.showEmptyState();
    } else {
      this.renderFavorites();
    }
  },

  // Mostrar estado vacío
  showEmptyState() {
    const emptyDiv = document.getElementById("emptyFavorites");
    const gridDiv = document.getElementById("favoritesGrid");
    const actionsDiv = document.getElementById("favoritesActions");

    if (emptyDiv) emptyDiv.style.display = "block";
    if (gridDiv) gridDiv.style.display = "none";
    if (actionsDiv) actionsDiv.style.display = "none";
  },

  // Renderizar favoritos
  renderFavorites() {
    const emptyDiv = document.getElementById("emptyFavorites");
    const gridDiv = document.getElementById("favoritesGrid");
    const actionsDiv = document.getElementById("favoritesActions");

    if (emptyDiv) emptyDiv.style.display = "none";
    if (gridDiv) gridDiv.style.display = "grid";
    if (actionsDiv) actionsDiv.style.display = "block";

    // Renderizar tarjetas
    this.renderFavoriteCards();
  },

  // Renderizar tarjetas de favoritos
  renderFavoriteCards() {
    const gridDiv = document.getElementById("favoritesGrid");
    if (!gridDiv) return;

    gridDiv.innerHTML = "";

    this.currentFavorites.forEach((show) => {
      const card = this.createFavoriteCard(show);
      gridDiv.appendChild(card);
    });
  },

  // Crear tarjeta de favorito
  createFavoriteCard(show) {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-show-id", show.id);

    // Imagen
    const imageUrl = show.image
      ? show.image.medium
      : "https://via.placeholder.com/300x400?text=Sin+Imagen";
    const imageAlt = show.name
      ? `Poster de ${show.name}`
      : "Poster no disponible";

    // Rating
    const rating =
      show.rating && show.rating.average
        ? show.rating.average.toFixed(1)
        : "N/A";

    // Géneros
    const genres =
      show.genres && show.genres.length > 0
        ? show.genres
            .slice(0, 3)
            .map((genre) => `<span class="genre-tag">${genre}</span>`)
            .join("")
        : '<span class="genre-tag">Sin género</span>';

    // Resumen
    const summary = show.summary
      ? this.stripHtml(show.summary).substring(0, 150) + "..."
      : "No hay descripción disponible.";

    // Estado
    const status = show.status || "Desconocido";

    // Fecha añadido
    const addedDate = show.addedDate
      ? this.formatDate(show.addedDate)
      : "Fecha desconocida";

    card.innerHTML = `
      <img src="${imageUrl}" alt="${imageAlt}" class="card__image" loading="lazy">
      <div class="card__content">
        <h3 class="card__title">${show.name || "Título no disponible"}</h3>
        <div class="card__meta">
          <span class="card__rating">${rating}</span>
          <span class="card__status">${status}</span>
        </div>
        <div class="card__genres">
          ${genres}
        </div>
        <div class="card__summary">
          ${summary}
        </div>
        <div class="card__added-date" style="margin-top: 0.5rem;">
          <small style="color: #6b7280;">Añadido: ${addedDate}</small>
        </div>
        <div class="card__actions" style="margin-top: 1rem;">
          <button class="remove-favorite-btn btn btn--danger btn--small" data-show-id="${
            show.id
          }">
            Quitar de favoritos
          </button>
        </div>
      </div>
    `;

    // Evento click para ir a detalles (excepto en botones)
    card.addEventListener("click", (e) => {
      if (!e.target.closest("button")) {
        this.navigateToDetails(show.id);
      }
    });

    // Evento para quitar de favoritos
    const removeBtn = card.querySelector(".remove-favorite-btn");
    if (removeBtn) {
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleRemoveFavorite(show.id, card);
      });
    }

    return card;
  },

  // Manejar quitar favorito
  handleRemoveFavorite(showId, cardElement) {
    const confirmMessage =
      "¿Estás seguro de que quieres quitar esta serie de tus favoritos?";

    if (confirm(confirmMessage)) {
      const removed = favorites.removeFromFavorites(showId);

      if (removed) {
        // Animación de salida
        cardElement.style.transition = "transform 0.3s ease, opacity 0.3s ease";
        cardElement.style.transform = "scale(0.8)";
        cardElement.style.opacity = "0";

        setTimeout(() => {
          this.loadAndRenderFavorites();
        }, 300);

        favorites.showFeedback("Serie quitada de favoritos");
      }
    }
  },

  // Manejar limpiar todos los favoritos
  handleClearAllFavorites() {
    const favoritesCount = this.currentFavorites.length;

    if (favoritesCount === 0) {
      alert("No tienes favoritos para eliminar.");
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres eliminar todos tus ${favoritesCount} favoritos? Esta acción no se puede deshacer.`;

    if (confirm(confirmMessage)) {
      favorites.clearAllFavorites();
      this.loadAndRenderFavorites();
      favorites.showFeedback("Todos los favoritos han sido eliminados");
    }
  },

  // Navegar a página de detalles
  navigateToDetails(showId) {
    window.location.href = `details.html?id=${showId}`;
  },

  // Utilidades
  stripHtml(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  },

  formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  },
};

// Inicializar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {
  favoritesPage.init();
});
