const favorites = {
  storageKey: "tvmaze_favorites",

  loadFavorites() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error cargando favoritos:", error);
      return [];
    }
  },

  saveFavorites(favoritesArray) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(favoritesArray));
      this.updateFavoritesCounter();
    } catch (error) {
      console.error("Error guardando favoritos:", error);
    }
  },

  addToFavorites(show) {
    const currentFavorites = this.loadFavorites();

    if (this.isFavorite(show.id)) {
      return false;
    }

    const favoriteShow = {
      id: show.id,
      name: show.name,
      image: show.image,
      rating: show.rating,
      genres: show.genres,
      status: show.status,
      summary: show.summary,
      premiered: show.premiered,
      network: show.network,
      language: show.language,
      runtime: show.runtime,
      addedDate: new Date().toISOString(),
    };

    currentFavorites.push(favoriteShow);
    this.saveFavorites(currentFavorites);
    return true;
  },

  removeFromFavorites(showId) {
    const currentFavorites = this.loadFavorites();
    const updatedFavorites = currentFavorites.filter(
      (show) => show.id !== parseInt(showId)
    );

    if (updatedFavorites.length < currentFavorites.length) {
      this.saveFavorites(updatedFavorites);
      return true;
    }
    return false;
  },

  isFavorite(showId) {
    const currentFavorites = this.loadFavorites();
    return currentFavorites.some((show) => show.id === parseInt(showId));
  },

  toggleFavorite(show) {
    if (this.isFavorite(show.id)) {
      this.removeFromFavorites(show.id);
      return false;
    } else {
      this.addToFavorites(show);
      return true;
    }
  },

  getAllFavorites() {
    return this.loadFavorites();
  },

  getFavoritesCount() {
    return this.loadFavorites().length;
  },

  clearAllFavorites() {
    this.saveFavorites([]);
    return true;
  },

  createFavoriteButton(showId, show) {
    const button = document.createElement("button");
    button.className = "btn btn--small btn--outline favorite-btn";
    button.dataset.showId = showId;
    button.style.marginTop = "1rem";

    this.updateFavoriteButtonState(button, showId);

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handleFavoriteClick(showId, show, button);
    });

    return button;
  },

  updateFavoriteButtonState(button, showId) {
    const isFav = this.isFavorite(showId);
    const icon = isFav ? "♥" : "♡";
    const text = isFav ? "Quitar de favoritos" : "Añadir a favoritos";

    button.innerHTML = `<span class="btn__icon">${icon}</span> ${text}`;

    if (isFav) {
      button.classList.add("btn--favorite");
    } else {
      button.classList.remove("btn--favorite");
    }
  },

  async handleFavoriteClick(showId, show, button) {
    try {
      let showData = show;

      if (!showData || !showData.name) {
        showData = await api.getShowDetails(showId);
      }

      const isNowFavorite = this.toggleFavorite(showData);
      this.updateFavoriteButtonState(button, showId);

      const message = isNowFavorite
        ? "Añadido a favoritos ♥"
        : "Quitado de favoritos";
      this.showFeedback(message);
    } catch (error) {
      console.error("Error manejando favorito:", error);
      this.showFeedback("Error al actualizar favoritos", true);
    }
  },

  showFeedback(message, isError = false) {
    console.log(message);

    const notification = document.createElement("div");
    notification.className = `notification ${
      isError ? "notification--error" : "notification--success"
    }`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isError ? "#ef4444" : "#10b981"};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  },

  updateFavoritesCounter() {
    const favoritesLink = document.querySelector('a[href="favorites.html"]');
    if (!favoritesLink) return;

    const existingCounter = favoritesLink.querySelector(".favorites-counter");
    if (existingCounter) {
      existingCounter.remove();
    }

    const count = this.getFavoritesCount();
    if (count > 0) {
      const counter = document.createElement("span");
      counter.className = "favorites-counter";
      counter.textContent = count;
      favoritesLink.appendChild(counter);
    }
  },

  init() {
    this.updateFavoritesCounter();

    // Agregar estilos CSS para notificaciones
    if (!document.getElementById("favorites-styles")) {
      const style = document.createElement("style");
      style.id = "favorites-styles";
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .btn--favorite {
          background-color: #ef4444 !important;
          color: white !important;
          border-color: #ef4444 !important;
        }
      `;
      document.head.appendChild(style);
    }
  },
};
